import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import {
  OrderEventType,
  OrderEventSource,
  PaymentStatus,
} from '@prisma/client';

import {
  deriveOrderState,
  assertValidTransition,
  OrderState,
} from '../domain';

type FakePaymentMode =
  | 'ALWAYS_SUCCESS'
  | 'ALWAYS_FAIL'
  | 'FAIL_ONCE_THEN_SUCCESS';

@Injectable()
export class FakePaymentGateway {
  private readonly mode: FakePaymentMode = 'ALWAYS_SUCCESS';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Simulate a payment provider callback.
   * This emits PAYMENT_SUCCEEDED or PAYMENT_FAILED.
   */
  async processPayment(paymentId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // ===============================
      // Step 1: Load payment
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

      const currentState: OrderState = deriveOrderState(events);

      // ===============================
      // Step 3: Decide outcome (simulation)
      // ===============================
      const shouldSucceed =
        this.mode === 'ALWAYS_SUCCESS' ||
        (this.mode === 'FAIL_ONCE_THEN_SUCCESS' &&
          payment.status === PaymentStatus.FAILED);

      const nextEventType = shouldSucceed
        ? OrderEventType.PAYMENT_SUCCEEDED
        : OrderEventType.PAYMENT_FAILED;

      // ===============================
      // Step 4: Validate transition
      // ===============================
      assertValidTransition(currentState, nextEventType);

      // ===============================
      // Step 5: Update payment record
      // ===============================
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: shouldSucceed
            ? PaymentStatus.SUCCEEDED
            : PaymentStatus.FAILED,
        },
      });

      // ===============================
      // Step 6: Emit outcome event
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
            mode: this.mode,
          },
        },
      });
    });
  }
}
