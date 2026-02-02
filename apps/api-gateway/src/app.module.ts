import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { IpThrottlerGuard } from './guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    // IP-based rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            // Allow N requests per time window (configurable via env vars)
            ttl: parseInt(configService.get<string>('RATE_LIMIT_TTL') ?? '60000', 10), // Default: 60000 milliseconds (60 seconds)
            limit: parseInt(configService.get<string>('RATE_LIMIT_MAX') ?? '100', 10), // Default: 100 requests
          },
        ],
      }),
      inject: [ConfigService],
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
export class AppModule {}
