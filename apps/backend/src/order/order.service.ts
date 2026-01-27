import { Injectable, Inject } from '@nestjs/common';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from './infra/order.repository.interface';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private orderRepository: IOrderRepository,
  ) {}

  /**
   * Checkout - Convert user's cart into an order
   * This is an idempotent, event-driven, snapshot-based checkout function
   */
  async checkout(userId: string, idempotencyKey: string): Promise<string> {
    return await this.orderRepository.checkout(userId, idempotencyKey);
  }
}
