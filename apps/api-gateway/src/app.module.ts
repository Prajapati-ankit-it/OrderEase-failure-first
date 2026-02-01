import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { jwtConfig } from '@orderease/shared-config';
import { parseJwtExpiration } from '@orderease/shared-utils';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { JwtAuthMiddleware } from './middleware';
import { IpThrottlerGuard } from './guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    HttpModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret') ?? 'default-secret';
        const expiresIn = parseJwtExpiration(
          configService.get<string>('jwt.expiresIn'),
          '7d',
        );
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    // IP-based rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'short',
            // Allow N requests per time window (configurable via env vars)
            ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // Default: 60 seconds
            limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Default: 100 requests
          },
        ],
      }),
    }),
  ],
  controllers: [ProxyController],
  providers: [
    ProxyService,
    {
      provide: APP_GUARD,
      useClass: IpThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      // Apply to all routes except auth endpoints
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'public/(.*)', method: RequestMethod.ALL },
        { path: 'health/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
