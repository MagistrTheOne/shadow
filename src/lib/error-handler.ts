import { TRPCError } from "@trpc/server";
import { toast } from "sonner";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(
    message: string,
    code: string = "INTERNAL_SERVER_ERROR",
    statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function handleTRPCError(
  error: TRPCError | Error,
  options: ErrorHandlerOptions = {}
): {
  message: string;
  code: string;
  shouldRetry: boolean;
} {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = "An unexpected error occurred",
  } = options;

  let message = fallbackMessage;
  let code = "UNKNOWN_ERROR";
  let shouldRetry = false;

  // Handle TRPC errors
  if (error instanceof TRPCError) {
    code = error.code;
    message = error.message;

    // Determine if error is retryable
    switch (error.code) {
      case "TIMEOUT":
      case "CLIENT_CLOSED_REQUEST":
      case "INTERNAL_SERVER_ERROR":
        shouldRetry = true;
        break;
      case "UNAUTHORIZED":
      case "FORBIDDEN":
      case "NOT_FOUND":
      case "BAD_REQUEST":
        shouldRetry = false;
        break;
      default:
        shouldRetry = false;
    }
  } else if (error instanceof AppError) {
    code = error.code;
    message = error.message;
    shouldRetry = error.statusCode >= 500;
  } else {
    // Generic error
    message = error.message || fallbackMessage;
    shouldRetry = true;
  }

  // Log error for monitoring
  if (logError) {
    console.error(`[${code}] ${message}`, {
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
    });
  }

  // Show toast notification
  if (showToast && typeof window !== "undefined") {
    const toastOptions = {
      description: shouldRetry ? "You can try again" : undefined,
    };

    switch (code) {
      case "UNAUTHORIZED":
        toast.error("Authentication required", {
          description: "Please sign in to continue",
        });
        break;
      case "FORBIDDEN":
        toast.error("Access denied", {
          description: "You don't have permission to perform this action",
        });
        break;
      case "NOT_FOUND":
        toast.error("Not found", {
          description: "The requested resource was not found",
        });
        break;
      case "VALIDATION_ERROR":
        toast.error("Invalid input", {
          description: message,
        });
        break;
      case "NETWORK_ERROR":
        toast.error("Connection error", {
          description: "Please check your internet connection",
        });
        break;
      case "TIMEOUT":
        toast.error("Request timeout", {
          description: "The operation took too long to complete",
        });
        break;
      case "INTERNAL_SERVER_ERROR":
        toast.error("Server error", {
          description: "Something went wrong on our end. Please try again later.",
        });
        break;
      default:
        toast.error("Error", { description: message });
    }
  }

  return { message, code, shouldRetry };
}

export function createErrorMessage(
  error: unknown,
  fallback: string = "An unexpected error occurred"
): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}

export function isRetryableError(error: TRPCError | Error): boolean {
  if (error instanceof TRPCError) {
    return ["TIMEOUT", "NETWORK_ERROR", "INTERNAL_SERVER_ERROR"].includes(
      error.code
    );
  }
  return false;
}

// Utility function for form validation errors
export function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ");
}

// Global error boundary helper
export function logGlobalError(
  error: Error,
  errorInfo?: { componentStack?: string }
) {
  console.error("Global Error Boundary:", {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "server",
  });

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
}
