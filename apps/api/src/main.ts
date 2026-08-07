import { Logger } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import * as express from "express";
import helmet from "helmet";
import * as compression from "compression";

import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";
import { TransformInterceptor } from "./common/interceptors";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";
import { CustomValidationPipe } from "./common/pipes/validation.pipe";
import { AppConfigService } from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const appConfig = app.get(AppConfigService);

  // Global prefix for all API routes
  app.setGlobalPrefix("api");

  // Enable NestJS shutdown hooks for graceful connection termination
  app.enableShutdownHooks();

  // Register production security middlewares
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Configure global validation pipe with strict filtering and custom formatting
  app.useGlobalPipes(new CustomValidationPipe());

  // Configure global exception filters
  app.useGlobalFilters(
    new GlobalExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  // Configure global interceptors for logging and response transformations
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new TimeoutInterceptor(app.get(Reflector)),
  );

  // Configure global rate limiting guard
  app.useGlobalGuards(app.get(ThrottlerGuard));

  // Production-ready CORS configuration
  const corsOrigin = appConfig.corsOrigin;
  app.enableCors({
    origin: corsOrigin.includes(",") ? corsOrigin.split(",") : corsOrigin,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Swagger API Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle("LifeKit API")
    .setDescription("LifeKit Core Backend API")
    .setVersion("0.1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter your JWT access token to authorize requests",
        in: "header",
      },
      "JWT-auth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  // Start HTTP Server
  const port = appConfig.port;
  await app.listen(port);
  logger.log(
    `LifeKit Backend Foundation is running on: http://localhost:${port}/api`,
  );
  logger.log(
    `API Swagger Documentation is available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
