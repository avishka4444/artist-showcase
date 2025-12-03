export class ApiError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again later.";
};

export const logError = (error: unknown, context?: string) => {
  if (import.meta.env.DEV) {
    console.error(`[${context || "Error"}]`, error);
  }
};

