export type AppError = Error & {
  statusCode: number;
  errorCode: string;
};

export function createAppError(message: string, statusCode: number, errorCode: string): AppError {
  const error = new Error(message) as AppError;

  error.name = "AppError";
  error.statusCode = statusCode;
  error.errorCode = errorCode;

  return error;
}

export function isAppError(error: unknown): error is AppError {
  if (!(error instanceof Error)) {
    return false;
  }

  const candidate = error as Partial<AppError>;

  return (
    typeof candidate.statusCode === "number" &&
    typeof candidate.errorCode === "string" &&
    error.name === "AppError"
  );
}
