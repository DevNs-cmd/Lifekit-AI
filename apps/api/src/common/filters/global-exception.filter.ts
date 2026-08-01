import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponse } from "../utils/api-response.util";
import {
  formatHttpException,
  formatValidationException,
} from "../utils/exception-formatters";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId =
      (request.headers["x-request-id"] as string) || "unknown";

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";
    let error = "Internal Server Error";
    let errorCode = "INTERNAL_SERVER_ERROR";

    if (exception instanceof HttpException) {
      const isValidation = Array.isArray(
        (exception.getResponse() as any)?.message,
      );
      const formatted = isValidation
        ? formatValidationException(exception)
        : formatHttpException(exception);

      statusCode = formatted.statusCode;
      message = formatted.message;
      error = formatted.error;
      errorCode = formatted.errorCode;
    } else if (exception instanceof Error) {
      this.logger.error(
        `[Unhandled Exception] Message: ${exception.message} | CorrelationId: ${correlationId}`,
        exception.stack,
      );

      if (process.env.NODE_ENV === "development") {
        message = exception.message;
        error = exception.name;
        errorCode = "UNHANDLED_ERROR";
      }
    } else {
      this.logger.error(
        `[Unknown Exception] Object: ${JSON.stringify(exception)} | CorrelationId: ${correlationId}`,
      );
    }

    const errorResponse = new ErrorResponse(
      statusCode,
      message,
      error,
      request.url,
      errorCode,
    );

    response.status(statusCode).json(errorResponse);
  }
}
