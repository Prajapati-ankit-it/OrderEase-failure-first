import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  AppLoggerService,
  GlobalExceptionFilter,
  LoggingInterceptor,
} from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Get logger service
  const logger = app.get(AppLoggerService);
  logger.setContext('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('app.corsOrigin') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Get instances for global interceptor and filter
  const loggingInterceptor = new LoggingInterceptor(
    app.get(AppLoggerService),
  );
  const exceptionFilter = new GlobalExceptionFilter(
    app.get(AppLoggerService),
    configService,
  );

  // Global interceptors (Structured Logging)
  app.useGlobalInterceptors(loggingInterceptor);

  // Global exception filter (Structured Error Handling)
  app.useGlobalFilters(exceptionFilter);

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('OrderEase API')
    .setDescription('RBAC-enabled OrderEase Backend')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  
  logger.log(`OrderEase RBAC API is running on: http://localhost:${port}`);
  logger.log(`API endpoints available at: http://localhost:${port}/api`);
  logger.log(`API Documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`API Gateway active with structured logging and error handling`);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | unknown, promise: Promise<unknown>) => {
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  const errorStack = reason instanceof Error ? reason.stack : undefined;
  
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    context: 'UnhandledRejection',
    message: `Unhandled Promise Rejection: ${errorMessage}`,
    error: {
      message: errorMessage,
      stack: errorStack,
    },
  }));
  
  // Exit process in production, keep running in development for debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    context: 'UncaughtException',
    message: `Uncaught Exception: ${error.message}`,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  }));
  
  // Always exit on uncaught exception
  process.exit(1);
});

bootstrap().catch((err) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    context: 'Bootstrap',
    message: 'Failed to start application',
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
  }));
  process.exit(1);
});
