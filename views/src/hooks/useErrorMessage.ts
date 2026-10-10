import { useCallback } from "react";
import { ApiError } from "../lib/api";

export function useErrorMessage() {
  return useCallback((error: unknown, fallback: string) => {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  }, []);
}
