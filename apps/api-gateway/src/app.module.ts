import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@orderease/shared-config';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { JwtAuthMiddleware } from './middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    HttpModule,
    JwtModule.register({}),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
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
