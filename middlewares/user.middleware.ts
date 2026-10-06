import type { Request } from "express";
import User from "../models/user.model.js";
import type { AuthTokenPayload } from "../types/auth.js";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../types/apiError.js";

export const verifyToken = asyncHandler(async (req: Request, res, next) => {
  const accessToken = req.cookies?.accessToken as string | undefined;
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (!accessToken && !refreshToken) {
    throw new ApiError("User is not logged in.", 401);
  }

  let decodedAccessToken: AuthTokenPayload | undefined;
  if (accessToken) {
    try {
      decodedAccessToken = verifyAccessToken(accessToken);
    } catch {
      // An expired access token can be renewed with a valid refresh token.
    }

    if (decodedAccessToken) {
      const user = await User.findById(decodedAccessToken.id);

      if (!user) {
        throw new ApiError("Unauthorized access.", 401);
      }

      req.user = { id: user._id.toString(), role: user.role };
      return next();
    }
  }

  if (!refreshToken) {
    throw new ApiError("Unauthorized access.", 401);
  }

  let decodedRefreshToken: AuthTokenPayload;
  try {
    decodedRefreshToken = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError("Unauthorized access.", 401);
  }

  const user = await User.findById(decodedRefreshToken.id);
  if (!user) {
    throw new ApiError("Unauthorized access.", 401);
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError("Invalid refresh token.", 401);
  }

  const newAccessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  req.user = { id: user._id.toString(), role: user.role };
  return next();
});