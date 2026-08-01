import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestIdHeader = "x-request-id";
    const requestId = (req.headers[requestIdHeader] as string) || randomUUID();

    // Set in request context and header
    req.headers[requestIdHeader] = requestId;
    (req as any).id = requestId;

    // Set in response header so clients can report bugs with correlation IDs
    res.setHeader(requestIdHeader, requestId);
    next();
  }
}
