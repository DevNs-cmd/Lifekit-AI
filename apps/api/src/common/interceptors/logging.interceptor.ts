import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(
            `${method} ${url} ${statusCode} - ${userAgent} - ${ip} - ${duration}ms`,
          );
        },
        error: (err: any) => {
          const duration = Date.now() - startTime;
          const statusCode = err instanceof HttpException ? err.getStatus() : 500;
          this.logger.error(
            `${method} ${url} ${statusCode} - ${userAgent} - ${ip} - ${duration}ms - Error: ${err.message || err}`,
          );
        },
      }),
    );
  }
}
import { HttpException } from '@nestjs/common';
