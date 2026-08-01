import { HttpException, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";

export interface FormattedError {
  statusCode: number;
  message: string | string[];
  error: string;
  errorCode: string;
}

export function formatValidationException(
  exception: HttpException,
): FormattedError {
  const response = exception.getResponse() as any;
  const message = response?.message || exception.message;
  return {
    statusCode: exception.getStatus(),
    message: Array.isArray(message) ? message : [message],
    error: response?.error || "Bad Request",
    errorCode: "VALIDATION_ERROR",
  };
}

export function formatHttpException(exception: HttpException): FormattedError {
  const statusCode = exception.getStatus();
  const response = exception.getResponse() as any;
  let message: string | string[] = exception.message;
  let error = exception.name;

  if (typeof response === "object" && response !== null) {
    message = response.message || exception.message;
    error = response.error || exception.name;
  } else if (typeof response === "string") {
    message = response;
  }

  // Derive an error code from the HTTP status/name
  const errorCode = error.toUpperCase().replace(/\s+/g, "_") + "_ERROR";

  return {
    statusCode,
    message,
    error,
    errorCode,
  };
}

export function formatPrismaException(
  error: Prisma.PrismaClientKnownRequestError,
): FormattedError {
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: string | string[] = "Internal database error";
  let errorName = "Database Error";
  let errorCode = "DATABASE_ERROR";

  switch (error.code) {
    case "P2002": {
      statusCode = HttpStatus.CONFLICT;
      const targets = (error.meta?.target as string[]) || [];
      message = `Unique constraint violation on field(s): ${targets.join(", ")}`;
      errorName = "Conflict";
      errorCode = "UNIQUE_CONSTRAINT_VIOLATION";
      break;
    }
    case "P2025": {
      statusCode = HttpStatus.NOT_FOUND;
      message = (error.meta?.cause as string) || "Record not found";
      errorName = "Not Found";
      errorCode = "RECORD_NOT_FOUND";
      break;
    }
    case "P2003": {
      statusCode = HttpStatus.BAD_REQUEST;
      const field = (error.meta?.field_name as string) || "unknown";
      message = `Foreign key constraint failed on field: ${field}`;
      errorName = "Bad Request";
      errorCode = "FOREIGN_KEY_VIOLATION";
      break;
    }
    default: {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        process.env.NODE_ENV === "production"
          ? "A database error occurred"
          : `Database error code ${error.code}: ${error.message}`;
      errorName = "Internal Server Error";
      errorCode = `PRISMA_${error.code}_ERROR`;
      break;
    }
  }

  return {
    statusCode,
    message,
    error: errorName,
    errorCode,
  };
}
