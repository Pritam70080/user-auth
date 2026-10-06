import type { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import type { AuthTokenPayload } from "../types/auth.js";
import type { UserRole } from "../types/user.js";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken as string | undefined;
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({
        success: false,
        message: "User is not logged in",
      });
    }

    if (accessToken) {
      try {
        const decodedAccessToken = verifyAccessToken(accessToken) as AuthTokenPayload;
        const user = await User.findById(decodedAccessToken.id);

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized access",
          });
        }

        req.user = { id: user._id.toString(), role: user.role };
        return next();
      } catch (error) {
        console.error("Access token is expired: ", error);
      }
    }

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    try {
      const decodedRefreshToken = verifyRefreshToken(refreshToken) as AuthTokenPayload;
      const user = await User.findById(decodedRefreshToken.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      if (user.refreshToken !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const newAccessToken = generateAccessToken({id: user._id.toString(), role: user.role})
      const newRefreshToken = generateRefreshToken({id: user._id.toString(), role: user.role})

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
    } catch (error) {
      console.error("Error validating token: ", error);
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
  } catch (error) {
    console.error("Error validating token: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};