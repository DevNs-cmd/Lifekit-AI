import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // Enable NestJS shutdown hooks for graceful connection termination
  app.enableShutdownHooks();

  // Configure global validation pipe with strict filtering
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure global exception filter to return standard JSON error structures
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configure global interceptors for logging and response transformations
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Production-ready CORS configuration
  const corsOrigin = configService.get<string>('app.corsOrigin') || 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin.includes(',') ? corsOrigin.split(',') : corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('LifeKit API')
    .setDescription('LifeKit Core Backend API')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token to authorize requests',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start HTTP Server
  const port = configService.get<number>('app.port') || 4000;
  await app.listen(port);
  logger.log(`LifeKit Backend Foundation is running on: http://localhost:${port}/api`);
  logger.log(`API Swagger Documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
