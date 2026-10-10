export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1/auth").replace(
  /\/$/,
  "",
);

async function sendRequest<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  let result: ApiResponse<T>;
  try {
    result = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("The server returned an unreadable response.", response.status);
  }

  if (!response.ok || !result.success) {
    throw new ApiError(result.message || "The request could not be completed.", response.status);
  }

  return result;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retryWithRefresh = false,
): Promise<ApiResponse<T>> {
  try {
    return await sendRequest<T>(path, init);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !retryWithRefresh) {
      throw error;
    }

    await sendRequest<null>("/refresh", { method: "POST" });
    return sendRequest<T>(path, init);
  }
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}
