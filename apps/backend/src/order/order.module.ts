import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PaymentOrchestratorService } from './application/payment-orchestrator.service';
import { FakePaymentGateway } from './infra/fake-payment.gateway';
import { DatabaseModule } from '@orderease/shared-database';
import { PrismaOrderRepository } from './infra/prisma-order.repository';
import { ORDER_REPOSITORY } from './infra/order.repository.interface';
import { PaymentRecoveryWorker } from './application/recovery/payment-recovery.worker';
import { RefundRecoveryWorker } from './application/recovery/refund-recovery-worker';
import { RefundOrchestratorService } from './application/refund-orchestrator.service';
import { PrismaPaymentRepository } from './infra/prisma-payment.repository';
import { PAYMENT_REPOSITORY } from './infra/payment.repository.interface';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    PaymentRecoveryWorker,
    PaymentOrchestratorService,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PrismaPaymentRepository,
    },
    FakePaymentGateway,
    RefundOrchestratorService,
    RefundRecoveryWorker,
  ],
  exports: [OrderService, ORDER_REPOSITORY, PAYMENT_REPOSITORY],
})
export class OrderModule {}
