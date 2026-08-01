import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../utils/api-response.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resBody = exception.getResponse() as any;

      if (typeof resBody === 'object' && resBody !== null) {
        message = resBody.message || exception.message;
        error = resBody.error || exception.name;
      } else {
        message = resBody || exception.message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);

      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
        error = exception.name;
      }
    } else {
      this.logger.error(`Unknown Unhandled Exception: ${JSON.stringify(exception)}`);
    }

    const errorResponse = new ErrorResponse(
      statusCode,
      message,
      error,
      request.url,
    );

    response.status(statusCode).json(errorResponse);
  }
}
