import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderApplicationService } from './application/order.service';
import { PaymentOrchestratorService } from './application/payment-orchestrator.service';
import { FakePaymentGateway } from './infra/fake-payment.gateway';
import { DatabaseModule } from '@orderease/shared-database';
import { PrismaOrderRepository } from './infra/prisma-order.repository';
import { ORDER_REPOSITORY } from './infra/order.repository.interface';
import { PaymentRecoveryWorker } from './application/recovery/payment-recovery.worker';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderController],
  providers: [
    OrderApplicationService,
    PaymentRecoveryWorker,
    PaymentOrchestratorService,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    FakePaymentGateway,
  ],
  exports: [OrderApplicationService, ORDER_REPOSITORY],
})
export class OrderModule {}
