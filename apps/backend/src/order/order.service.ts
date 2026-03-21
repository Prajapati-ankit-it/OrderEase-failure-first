import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from './infra/order.repository.interface';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private orderRepository: IOrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Checkout - Convert user's cart into an order
   * This is an idempotent, event-driven, snapshot-based checkout function
   * Payment is handled separately by Payment module
   */
  async checkout(userId: string, idempotencyKey: string): Promise<string> {
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existing) {
      return (existing.response as { orderId: string }).orderId;
    }

    // Create order + events (transaction inside repo)
    const orderId = await this.orderRepository.checkout(
      userId,
      idempotencyKey,
    );

    return orderId;
  }

  /**
   * Get Order Timeline - Retrieve chronological events for an order
   */
  async getTimeline(orderId: string) {
    return await this.orderRepository.timeline(orderId);
  }
}
