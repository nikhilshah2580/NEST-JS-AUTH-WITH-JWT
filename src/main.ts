import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NextFunction, Response } from 'express';

import { AppModule } from './app.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import {
  RequestIdMiddleware,
  RequestWithId,
} from './common/middleware/request-id.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const requestIdMiddleware = new RequestIdMiddleware();

  // All HTTP routes are served below /api.
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
  });

  // Request ID middleware
  app.use((request: RequestWithId, response: Response, next: NextFunction) =>
    requestIdMiddleware.use(request, response, next),
  );

  // DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ecommerce API Documentation')
    .setDescription('The Ecommerce API description')
    .setVersion('1.0')
    .addTag('Ecommerce')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Consider restricting Swagger access in production.
    SwaggerModule.setup('docs', app, document);

  // Global exception handling, response formatting, and roles
  const reflector = app.get(Reflector);

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalGuards(new RolesGuard(reflector));

  // Server port
  const port = configService.get<number>('PORT') ?? 3003;

  await app.listen(port);
}

void bootstrap();
