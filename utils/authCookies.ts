import type { Response } from "express";
import { getTokenMaxAge } from "./jwt.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: true,
  path: "/",
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: getTokenMaxAge(accessToken),
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: getTokenMaxAge(refreshToken),
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
}
