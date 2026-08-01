import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SuccessResponse, PaginatedResponse } from "../utils/api-response.util";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === "object") {
          if ("success" in data && data.success === true) {
            return data;
          }
          // Check if data matches PaginatedResult structure
          if (
            "data" in data &&
            Array.isArray((data as any).data) &&
            "total" in data &&
            "page" in data
          ) {
            const paginated = data as any;
            return new PaginatedResponse(
              statusCode,
              "Request completed successfully",
              paginated.data,
              {
                total: paginated.total,
                page: paginated.page,
                limit: paginated.limit,
                totalPages: paginated.totalPages,
              },
            );
          }
        }

        const message = "Request completed successfully";
        return new SuccessResponse(
          statusCode,
          message,
          data === undefined ? null : data,
        );
      }),
    );
  }
}
