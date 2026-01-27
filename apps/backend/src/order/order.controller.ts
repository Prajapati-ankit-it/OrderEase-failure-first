import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OrderApplicationService } from './application/order.service';
import { Auth, CurrentUser } from '../auth/decorators';
import { successResponse } from '@orderease/shared-utils';

@Controller('order')
export class OrderController {
  // constructor(private orderService: OrderService) {}
  constructor(private orderApplicationService: OrderApplicationService) {}

  /**
   * Checkout - Create order from cart (Logged-in users)
   * POST /order/checkout
   */
  @Post('checkout')
  @Auth() // Any authenticated user can checkout
  async checkout(
    @CurrentUser('id') userId: string,
    @Body('idempotencyKey') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('idempotencyKey is required');
    }

    const orderId = await this.orderApplicationService.checkout(userId, idempotencyKey);
    return successResponse('Order created successfully', { orderId });
  }
}
