import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from './infra/order.repository.interface';
import { PaymentOrchestratorService } from './application/payment-orchestrator.service';
import { FakePaymentGateway } from './infra/fake-payment.gateway';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private orderRepository: IOrderRepository,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
    private readonly fakePaymentGateway: FakePaymentGateway,
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Checkout - Convert user's cart into an order
   * This is an idempotent, event-driven, snapshot-based checkout function
   */
  async checkout(userId: string, idempotencyKey: string): Promise<string> {

    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existing) {
      return (existing.response as { orderId: string }).orderId;
    }
    // PHASE 1: Create order + events (transaction inside repo)
    const orderId = await this.orderRepository.checkout(
      userId,
      idempotencyKey,
    );

    // PHASE 2: Trigger next step AFTER COMMIT
    const paymentId = await this.paymentOrchestrator.initiatePayment(orderId);
    await this.fakePaymentGateway.processPayment(paymentId);
    return orderId;
  }

  /**
   * Get Order Timeline - Retrieve chronological events for an order
   */
  async getTimeline(orderId: string) {
    return await this.orderRepository.timeline(orderId);
  }
}
