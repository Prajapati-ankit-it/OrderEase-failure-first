import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { OrderEventType, OrderEventSource, PaymentStatus } from '@prisma/client';

import {
  deriveOrderState,
  assertValidTransition,
  OrderState,
} from '../domain';
import { FakePaymentGateway } from '../infra/fake-payment.gateway';
import type { IPaymentRepository } from '../infra/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../infra/payment.repository.interface';

@Injectable()
export class PaymentOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fakePaymentGateway: FakePaymentGateway,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  /**
   * Initiates payment for an order.
   * This function ONLY emits PAYMENT_INITIATED.
   * It does NOT call any external gateway.
   */
  async initiatePayment(orderId: string): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      // ===============================
      // Step 1: Load order events
      // ===============================
      const events = await tx.orderEvent.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });

      if (events.length === 0) {
        throw new BadRequestException(
          'Cannot initiate payment for non-existent order',
        );
      }

      // ===============================
      // Step 2: Derive current state
      // ===============================
      const currentState: OrderState = deriveOrderState(events);

      // ===============================
      // Step 3: Validate transition
      // ===============================
      assertValidTransition(
        currentState,
        OrderEventType.PAYMENT_INITIATED,
      );

      // ===============================
      // Step 4: Calculate payable amount
      // ===============================
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
      });

      // Amount in cents - use integer arithmetic
      const amount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (amount <= 0) {
        throw new BadRequestException('Invalid payment amount');
      }

      // ===============================
      // Step 5: Create Payment record
      // ===============================
      const payment = await tx.payment.create({
        data: {
          orderId,
          provider: 'FAKE_GATEWAY',
          amount,
          status: PaymentStatus.INITIATED,
        },
      });

      // ===============================
      // Step 6: Emit PAYMENT_INITIATED event
      // ===============================
      await tx.orderEvent.create({
        data: {
          orderId,
          type: OrderEventType.PAYMENT_INITIATED,
          causedBy: OrderEventSource.SYSTEM,
          paymentId: payment.id,
          payload: {
            amount,
            provider: 'FAKE_GATEWAY',
          },
        },
      });

      return payment.id;
    });
  }

  /**
   * Process a payment - orchestrates the entire payment workflow
   * This is the main business logic for payment processing:
   * 1. Load payment via repository
   * 2. Load order events
   * 3. Derive current order state
   * 4. Call FakePaymentGateway to simulate external payment
   * 5. Validate state transition using domain state machine
   * 6. Update payment status
   * 7. Emit OrderEvent (PAYMENT_SUCCEEDED / PAYMENT_FAILED)
   * 
   * All operations run inside prisma.$transaction
   */
  async processPayment(paymentId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // ===============================
      // Step 1: Load payment via repository
      // ===============================
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // ===============================
      // Step 2: Load order events
      // ===============================
      const events = await tx.orderEvent.findMany({
        where: { orderId: payment.orderId },
        orderBy: { createdAt: 'asc' },
      });

      // ===============================
      // Step 3: Derive current order state
      // ===============================
      const currentState: OrderState = deriveOrderState(events);

      // ===============================
      // Step 4: Call FakePaymentGateway to simulate external payment
      // ===============================
      const paymentResult = await this.fakePaymentGateway.charge(paymentId);

      // ===============================
      // Step 5: Determine next event type based on gateway response
      // ===============================
      const nextEventType = paymentResult === 'SUCCESS'
        ? OrderEventType.PAYMENT_SUCCEEDED
        : OrderEventType.PAYMENT_FAILED;

      // ===============================
      // Step 6: Validate state transition using domain state machine
      // ===============================
      assertValidTransition(currentState, nextEventType);

      // ===============================
      // Step 7: Update payment status
      // ===============================
      const newStatus = paymentResult === 'SUCCESS'
        ? PaymentStatus.SUCCEEDED
        : PaymentStatus.FAILED;

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      // ===============================
      // Step 8: Emit OrderEvent (PAYMENT_SUCCEEDED / PAYMENT_FAILED)
      // ===============================
      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          paymentId: payment.id,
          type: nextEventType,
          causedBy: OrderEventSource.PAYMENT_GATEWAY,
          payload: {
            amount: payment.amount,
            provider: payment.provider,
            simulated: true,
            result: paymentResult,
          },
        },
      });
    });
  }
}
