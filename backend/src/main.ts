import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor, GlobalExceptionFilter } from './gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

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

  // Global interceptors (API Gateway - Logging)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global exception filter (API Gateway - Error Handling)
  app.useGlobalFilters(new GlobalExceptionFilter());

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
  console.log(`🚀 OrderEase RBAC API is running on: http://localhost:${port}`);
  console.log(`📚 API endpoints available at: http://localhost:${port}/api`);
  console.log(
    `📖 API Documentation available at: http://localhost:${port}/api/docs`,
  );
  console.log(`🛡️  API Gateway active with logging and error handling`);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
