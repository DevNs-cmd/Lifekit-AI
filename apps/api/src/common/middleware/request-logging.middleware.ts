import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";
    const correlationId =
      (req as any).id || req.headers["x-request-id"] || "unknown";
    const startTime = Date.now();

    // Log request start
    const maskedBody = this.maskSensitiveData(req.body ?? {});

    const bodyStr =
      Object.keys(maskedBody).length > 0 ? JSON.stringify(maskedBody) : "";

    this.logger.log(
      `[Request Start] ${method} ${originalUrl} | ID: ${correlationId} | IP: ${ip} | UA: ${userAgent} ${
        bodyStr ? `| Body: ${bodyStr}` : ""
      }`,
    );

    // Intercept response finish
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      this.logger.log(
        `[Request End] ${method} ${originalUrl} | Status: ${statusCode} | ID: ${correlationId} | Duration: ${duration}ms`,
      );
    });

    next();
  }

  private maskSensitiveData(obj: any): any {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.maskSensitiveData(item));
    }

    const masked = { ...obj };
    const sensitiveKeys = [
      "password",
      "token",
      "refreshtoken",
      "refresh_token",
      "secret",
      "authorization",
      "cookie",
      "accesstoken",
      "access_token",
    ];

    for (const key of Object.keys(masked)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        masked[key] = "***MASKED***";
      } else if (typeof masked[key] === "object") {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }

    return masked;
  }
}
