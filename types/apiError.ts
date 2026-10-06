export class ApiError extends Error {
  readonly statusCode: number;
  readonly success = false;
  readonly errors: string[];

  constructor(message: string, statusCode = 500, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}