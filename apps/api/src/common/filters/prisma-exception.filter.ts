import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { ErrorResponse } from "../utils/api-response.util";
import { formatPrismaException } from "../utils/exception-formatters";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const formatted = formatPrismaException(exception);
    const correlationId =
      (request.headers["x-request-id"] as string) || "unknown";

    this.logger.error(
      `[Prisma Error] Code: ${exception.code} | Message: ${exception.message} | CorrelationId: ${correlationId}`,
      exception.stack,
    );

    const errorResponse = new ErrorResponse(
      formatted.statusCode,
      formatted.message,
      formatted.error,
      request.url,
      formatted.errorCode,
    );

    response.status(formatted.statusCode).json(errorResponse);
  }
}
