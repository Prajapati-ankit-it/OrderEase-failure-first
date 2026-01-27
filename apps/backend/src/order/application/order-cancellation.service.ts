import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import {
  OrderEventType,
  EventSource,
} from '@prisma/client';
import {
  deriveOrderState,
  assertValidTransition,
} from '../domain';

@Injectable()
export class OrderCancellationService {
  constructor(private readonly prisma: PrismaService) {}

  async cancelOrder(orderId: string, reason: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Load events
      const events = await tx.orderEvent.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });

      if (events.length === 0) {
        throw new BadRequestException('Order not found');
      }

      // 2️⃣ Derive state
      const currentState = deriveOrderState(events);

      // 3️⃣ Validate transition
      assertValidTransition(
        currentState,
        OrderEventType.ORDER_CANCELLED,
      );

      // 4️⃣ Emit cancellation event
      await tx.orderEvent.create({
        data: {
          orderId,
          type: OrderEventType.ORDER_CANCELLED,
          causedBy: EventSource.USER,
          payload: {
            reason,
            cancelledAt: new Date().toISOString(),
          },
        },
      });
    });
  }
}
