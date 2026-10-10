import type { Request } from "express";
import User from "../models/user.model.js";
import type { AuthTokenPayload } from "../types/auth.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../types/apiError.js";

export const verifyToken = asyncHandler(async (req: Request, _res, next) => {
  const accessToken = req.cookies?.accessToken as string | undefined;
  if (!accessToken) {
    throw new ApiError("Unauthorized access.", 401);
  }

  let decodedAccessToken: AuthTokenPayload;
  try {
    decodedAccessToken = verifyAccessToken(accessToken);
  } catch {
    throw new ApiError("Unauthorized access.", 401);
  }

  const user = await User.findById(decodedAccessToken.id);
  if (!user) {
    throw new ApiError("Unauthorized access.", 401);
  }

  req.user = { id: user._id.toString(), role: user.role };
  return next();
});