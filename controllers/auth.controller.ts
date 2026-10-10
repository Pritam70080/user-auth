import crypto from "crypto";
import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import User from "../models/user.model.js";
import {
  generateForgotPasswordEmail,
  generateVerifyEmail,
  sendVerificationEmail,
} from "../utils/sendMail.js";
import { ApiError } from "../types/apiError.js";
import { ApiResponse } from "../types/apiResponse.js";
import {
  type CreateUserInput,
  type EmailInput,
  type LoginInput,
  type ResetPasswordInput,
} from "../schemas/auth.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { clearAuthCookies, setAuthCookies } from "../utils/authCookies.js";
import type { AuthenticatedRequest, AuthTokenPayload } from "../types/auth.js";

const createTokenExpiry = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);

export const register = asyncHandler<ParamsDictionary, unknown, CreateUserInput>(
  async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw new ApiError("User already exists.", 409);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password,
      verificationToken: token,
      verificationTokenExpiry: createTokenExpiry(24),
    });

    const mailOptions = generateVerifyEmail(newUser.email, token);
    const isSent = await sendVerificationEmail(mailOptions);

    if (!isSent) {
      throw new ApiError("Failed to send verification email.", 502);
    }

    res
      .status(201)
      .json(new ApiResponse("User registered successfully. Please verify your email.", null, 201));
  },
);

export const verify = asyncHandler<{ token: string }>(async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("User not found.", 404);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  req.user = { id: user._id.toString(), role: user.role };

  res.status(200).json(
    new ApiResponse("User verified successfully.", {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }),
  );
});

export const login = asyncHandler<ParamsDictionary, unknown, LoginInput>(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError("User not found. Please register first.", 404);
  }

  if (!user.isVerified) {
    throw new ApiError("User account is not verified.", 401);
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw new ApiError("Incorrect email or password.", 401);
  }

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse("User logged in successfully.", {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }),
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    throw new ApiError("Refresh token is required.", 401);
  }

  let decodedRefreshToken: AuthTokenPayload;
  try {
    decodedRefreshToken = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError("Invalid or expired refresh token.", 401);
  }

  const user = await User.findById(decodedRefreshToken.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError("Invalid or expired refresh token.", 401);
  }

  const newAccessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });
  user.refreshToken = newRefreshToken;
  await user.save();

  setAuthCookies(res, newAccessToken, newRefreshToken);
  res.status(200).json(new ApiResponse("Tokens refreshed successfully."));
});

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError("Unauthorized access.", 401);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new ApiError("Invalid token.", 404);
    }

    res.status(200).json(new ApiResponse("User profile accessed.", {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    } ));
  },
);

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ApiError("Unauthorized access.", 401);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError("User not found.", 404);
    }
    user.refreshToken = null;
    await user.save();
    clearAuthCookies(res);

    res.status(200).json(new ApiResponse("User logged out successfully."));
  },
);

export const resendEmailVerification = asyncHandler<ParamsDictionary, unknown, EmailInput>(
  async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new ApiError("User not found.", 404);
    }

    if (user.isVerified) {
      throw new ApiError("User email is already verified.", 400);
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.verificationTokenExpiry = createTokenExpiry(24);
    await user.save();

    const mailOptions = generateVerifyEmail(user.email, token);
    const isSent = await sendVerificationEmail(mailOptions);
    if (!isSent) {
      throw new ApiError("Failed to send verification email.", 502);
    }

    res.status(200).json(new ApiResponse("Verification email sent successfully."));
  },
);

export const forgotPassword = asyncHandler<ParamsDictionary, unknown, EmailInput>(
  async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new ApiError("User not found.", 400);
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordTokenExpiry = createTokenExpiry(1 / 12);
    await user.save();

    const mailOptions = generateForgotPasswordEmail(user.email, token);
    const isSent = await sendVerificationEmail(mailOptions);
    if (!isSent) {
      throw new ApiError("Failed to send password reset email.", 502);
    }

    res.status(200).json(new ApiResponse("Reset password initiated."));
  },
);

export const resetPassword = asyncHandler<
  { token: string },
  unknown,
  ResetPasswordInput
>(async (req: Request<{ token: string }, unknown, ResetPasswordInput>, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid token or session expired.", 400);
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpiry = null;
  await user.save();

  res.status(200).json(new ApiResponse("Password updated successfully."));
});
