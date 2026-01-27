import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { OrderEventType, EventSource, PaymentStatus } from '@prisma/client';

import {
  deriveOrderState,
  assertValidTransition,
  OrderState,
} from '../domain';

@Injectable()
export class PaymentOrchestratorService {
  constructor(private readonly prisma: PrismaService) {}

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
          causedBy: EventSource.SYSTEM,
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
}
