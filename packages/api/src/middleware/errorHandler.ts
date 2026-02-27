export type ErrorType =
  | "USER_NOT_FOUND"
  | "BADGE_NOT_FOUND"
  | "INVALID_USERNAME"
  | "RATE_LIMITED"
  | "CREDLY_API_ERROR"
  | "INTERNAL_ERROR";

const STATUS_CODES: Record<ErrorType, number> = {
  USER_NOT_FOUND: 404,
  BADGE_NOT_FOUND: 404,
  INVALID_USERNAME: 400,
  RATE_LIMITED: 429,
  CREDLY_API_ERROR: 502,
  INTERNAL_ERROR: 500,
};

/** Custom error class for the application */
export class AppError extends Error {
  readonly type: ErrorType;
  readonly statusCode: number;

  constructor(type: ErrorType, message: string) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.statusCode = STATUS_CODES[type];
  }
}

export interface ErrorInfo {
  readonly type: ErrorType;
  readonly message: string;
  readonly suggestion: string;
}

const ERROR_SUGGESTIONS: Record<ErrorType, string> = {
  USER_NOT_FOUND: "Check the username matches your Credly profile URL.",
  BADGE_NOT_FOUND: "Verify the badge_id parameter.",
  INVALID_USERNAME: "Username should only contain letters, numbers, hyphens, and dots.",
  RATE_LIMITED: "Please wait a moment and try again.",
  CREDLY_API_ERROR: "This usually resolves within a few minutes.",
  INTERNAL_ERROR: "If this persists, please open an issue on GitHub.",
};

/** Map error types to user-friendly ErrorInfo objects */
export function createErrorInfo(
  type: ErrorType,
  context?: Record<string, string>,
): ErrorInfo {
  const messages: Record<ErrorType, string> = {
    USER_NOT_FOUND: `User "${context?.["username"] ?? "unknown"}" not found on Credly.`,
    BADGE_NOT_FOUND: `Badge not found for user "${context?.["username"] ?? "unknown"}".`,
    INVALID_USERNAME: "Invalid username format.",
    RATE_LIMITED: "Too many requests.",
    CREDLY_API_ERROR: "Credly API is temporarily unavailable.",
    INTERNAL_ERROR: "An unexpected error occurred.",
  };

  return {
    type,
    message: messages[type],
    suggestion: ERROR_SUGGESTIONS[type],
  };
}
