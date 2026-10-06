import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../types/apiError.js";
import { asyncHandler } from "./asyncHandler.js";

export const validateBody = (schema: ZodType) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const field = issue.path.join(".");
        return field ? `${field}: ${issue.message}` : issue.message;
      });
      next(new ApiError("Request validation failed.", 400, errors));
      return;
    }
    req.body = result.data;
    next();
  });
