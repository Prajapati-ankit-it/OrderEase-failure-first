import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@orderease/shared-database';
import { AuthModule } from './auth';
import { AdminModule } from './admin';
import { UserModule } from './user';
// import { PublicModule } from './public';
import { FoodModule } from './food';
// import { OrderModule } from './order';
// import { CartModule } from './cart';
import { HealthModule } from './health';
import { appConfig, databaseConfig, jwtConfig } from '@orderease/shared-config';
import {
  AppLoggerService,
  RequestContextMiddleware,
} from './gateway';

@Module({
  imports: [
    // Load environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    // Database module (Prisma)
    DatabaseModule,
    // Feature modules
    AuthModule,
    AdminModule,
    UserModule,
    // PublicModule,
    FoodModule,
    // CartModule,
    // OrderModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppLoggerService],
  exports: [AppLoggerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request context middleware to all routes
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
