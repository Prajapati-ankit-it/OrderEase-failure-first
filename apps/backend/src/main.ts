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
import { validateEnv } from './config';

/**
 * Parse and validate CORS origins from configuration
 */
function parseCorsOrigins(corsOrigin: string): string | string[] {
  if (corsOrigin === '*') {
    return '*';
  }
  return corsOrigin.split(',').map(origin => origin.trim());
}

/**
 * Create CORS origin validator function
 */
function createCorsOriginValidator(allowedOrigins: string | string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) {
      return callback(null, true);
    }

    // Allow all origins if wildcard is specified
    if (allowedOrigins === '*') {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Silently reject disallowed origins to avoid exposing CORS configuration
    callback(null, false);
  };
}

/**
 * Global error handlers for process-level errors
 * These use direct console output instead of AppLoggerService because:
 * - They may be triggered before the app is fully initialized
 * - The app/DI system may be in a broken state when these errors occur
 * - We need guaranteed error logging even if the logging infrastructure fails
 *
 * These handlers are registered at the top to catch all errors, including
 * those that occur during module initialization.
 */

// Handle uncaught exceptions - must be first to catch all errors
process.on('uncaughtException', (error: Error) => {
  // Using console.error directly as app may not be initialized
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      context: 'UncaughtException',
      message: `Uncaught Exception: ${error.message}`,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    }),
  );

  // Always exit on uncaught exception
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  const errorMessage =
    reason instanceof Error ? reason.message : String(reason);
  const errorStack = reason instanceof Error ? reason.stack : undefined;

  // Using console.error directly as app may not be initialized
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      context: 'UnhandledRejection',
      message: `Unhandled Promise Rejection: ${errorMessage}`,
      error: {
        message: errorMessage,
        stack: errorStack,
      },
    }),
  );

  // Exit process in production, keep running in development for debugging
  // Direct env access is intentional as ConfigService may not be available
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

async function bootstrap() {
  // Validate environment variables before starting the application
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Get logger service
  const logger = app.get(AppLoggerService);
  logger.setContext('Bootstrap');

  // Enable CORS
  const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
  const allowedOrigins = parseCorsOrigins(corsOrigin);
  
  app.enableCors({
    origin: createCorsOriginValidator(allowedOrigins),
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
    configService,
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
  logger.log(
    `API Documentation available at: http://localhost:${port}/api/docs`,
  );
  logger.log(`API Gateway active with structured logging and error handling`);
}

bootstrap().catch((err: Error) => {
  // Using console.error directly as app bootstrap failed
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      context: 'Bootstrap',
      message: 'Failed to start application',
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
    }),
  );
  process.exit(1);
});
