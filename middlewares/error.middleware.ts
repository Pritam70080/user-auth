import type { ErrorRequestHandler } from "express";
import { ApiError } from "../types/apiError.js";
import { ApiResponse } from "../types/apiResponse.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError("Internal server error.");

  if (!(error instanceof ApiError)) {
    console.error(error);
  }

  res
    .status(apiError.statusCode)
    .json(new ApiResponse(apiError.message, null, apiError.statusCode, apiError.errors));
};