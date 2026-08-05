import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SuccessResponse, PaginatedResponse } from "../utils/api-response.util";

function camelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function transformObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(transformObject);
  }

  if (typeof obj === "object") {
    if (
      obj.constructor &&
      obj.constructor.name !== "Object" &&
      obj.constructor.name !== "Array"
    ) {
      return obj;
    }
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const camelKey = camelCase(key);
      const transformedVal = transformObject(val);

      newObj[camelKey] = transformedVal;

      if (
        key === "id" ||
        key === "user_id" ||
        key === "mission_id" ||
        key === "task_id" ||
        key === "opportunity_id" ||
        key === "memory_id" ||
        key === "service_id" ||
        key === "preference_id" ||
        key === "subscription_id" ||
        key === "transaction_id" ||
        key === "payment_id" ||
        key === "profile_id" ||
        key === "interest_id" ||
        key === "journal_id" ||
        key.endsWith("_id") ||
        key.endsWith("Id")
      ) {
        const stringId =
          transformedVal !== null && transformedVal !== undefined
            ? String(transformedVal)
            : transformedVal;
        newObj[camelKey] = stringId;

        if (
          key === "user_id" ||
          key === "mission_id" ||
          key === "task_id" ||
          key === "opportunity_id" ||
          key === "memory_id" ||
          key === "service_id" ||
          key === "profile_id"
        ) {
          newObj["id"] = stringId;
        }
      }

      if (key === "profile_photo" || key === "profile_picture") {
        newObj["avatarUrl"] = transformedVal;
      }
    }
    return newObj;
  }

  return obj;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        const transformedData = transformObject(data);

        if (transformedData && typeof transformedData === "object") {
          if ("success" in transformedData && transformedData.success === true) {
            return transformedData;
          }
          if (
            "data" in transformedData &&
            Array.isArray((transformedData as any).data) &&
            "total" in transformedData &&
            "page" in transformedData
          ) {
            const paginated = transformedData as any;
            return new PaginatedResponse(
              statusCode,
              "Request completed successfully",
              paginated.data,
              {
                total: paginated.total,
                page: paginated.page,
                limit: paginated.limit,
                pageSize: paginated.limit,
                totalPages: paginated.totalPages,
              },
            );
          }
        }

        const message = "Request completed successfully";
        return new SuccessResponse(
          statusCode,
          message,
          transformedData === undefined ? null : transformedData,
        );
      }),
    );
  }
}
