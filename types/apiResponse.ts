export class ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];

  constructor(
    message = "Operation successful.",
    data: T | null = null,
    statusCode = 200,
    errors: string[] = [],
  ) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}