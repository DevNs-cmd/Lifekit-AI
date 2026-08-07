import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, throwError, TimeoutError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";

export const TIMEOUT_KEY = "request_timeout";
export const SetTimeout = (ms: number) => SetMetadata(TIMEOUT_KEY, ms);

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly reflector?: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const customTimeout = this.reflector
      ? this.reflector.get<number>(TIMEOUT_KEY, context.getHandler()) ||
        this.reflector.get<number>(TIMEOUT_KEY, context.getClass())
      : undefined;

    const timeoutMs = customTimeout ?? 60000; // 60 seconds default timeout

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException("Request execution timed out"),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
