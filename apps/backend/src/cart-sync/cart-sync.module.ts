import { Module } from '@nestjs/common';
import { CartSyncService } from './cart-sync.service';
import { CartSyncCron } from './cart-sync.cron';
import { PrismaService } from '@orderease/shared-database';
import { RedisService } from '../cart/redis.service';

@Module({
  providers: [CartSyncService, CartSyncCron, PrismaService, RedisService],
  exports: [CartSyncService],
})
export class CartSyncModule {}
