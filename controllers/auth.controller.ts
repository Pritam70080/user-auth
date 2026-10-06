import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Request, Response } from "express";
import User from "../models/user.model.js";
import {
  generateForgotPasswordEmail,
  generateVerifyEmail,
  sendVerificationEmail,
} from "../utils/sendMail.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import type { UserRole } from "../types/user.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

const createTokenExpiry = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);


export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required.",
      success: false,
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters.",
      success: false,
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = createTokenExpiry(24);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      verificationToken: token,
      verificationTokenExpiry: tokenExpiry,
    });

    if (!newUser) {
      return res.status(404).json({
        message: "Failed to register user.",
        success: false,
      });
    }

    const mailOptions = generateVerifyEmail(newUser.email, token);
    const isSent = await sendVerificationEmail(mailOptions);

    if (!isSent) {
      return res.status(400).json({
        message: "Failed to send mail",
        success: false,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Error Registering user: ", error);
    return res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  }
};

export const verify = async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "token is required!",
    });
  }

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    req.user = { id: user._id.toString(), role: user.role };

    return res.status(200).json({
      message: "User verified successfully",
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Error verifying user: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify user",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, Please register first",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "User account is not verified",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const accessToken = generateAccessToken({id: user._id.toString(), role: user.role});
    const refreshToken = generateRefreshToken({id: user._id.toString(), role: user.role});

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Error logging in user: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login user",
    });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile accessed",
      user,
    });
  } catch (error) {
    console.error("Error getting user profile: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized access",
        success: false,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.refreshToken = null;
    await user.save();
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const resendEmailVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User email is already verified",
        success: false,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = createTokenExpiry(24);
    user.verificationToken = token;
    user.verificationTokenExpiry = tokenExpiry;
    await user.save();

    const mailOptions = generateVerifyEmail(email, token);
    const mail = await sendVerificationEmail(mailOptions);
    if (!mail) {
      return res.status(400).json({
        message: "Mail couldn't be sent",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Verification email sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = createTokenExpiry(1 / 12);
    user.resetPasswordToken = token;
    user.resetPasswordTokenExpiry = tokenExpiry;
    await user.save();

    const mailOptions = generateForgotPasswordEmail(email, token);
    const isSent = await sendVerificationEmail(mailOptions);
    if (!isSent) {
      return res.status(400).json({
        message: "Failed to send mail",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Reset password initiated",
      success: true,
    });
  } catch (error) {
    console.error("Error handling forgot password", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body as { password?: string };

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
        success: false,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    } as Record<string, unknown>);

    if (!user) {
      return res.status(400).json({
        message: "Invalid token or session expired",
        success: false,
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating the password", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};