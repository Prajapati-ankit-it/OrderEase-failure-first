import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from './infra/order.repository.interface';
import { DatabaseModule } from '@orderease/shared-database';
import { PrismaOrderRepository } from './infra/prisma-order.repository';
import { RefundRecoveryWorker } from './application/recovery/refund-recovery-worker';
import { RefundOrchestratorService } from './application/refund-orchestrator.service';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    RefundOrchestratorService,
    RefundRecoveryWorker,
  ],
  exports: [OrderService, ORDER_REPOSITORY],
})
export class OrderModule {}
