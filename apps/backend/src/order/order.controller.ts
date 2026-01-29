import { Controller, Post, Body, BadRequestException, Param, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { Auth, CurrentUser } from '../auth/decorators';
import { successResponse } from '@orderease/shared-utils';

@Controller('order')
export class OrderController {
  constructor(
    private orderService: OrderService,
  ) { }

  // POST /order/checkout
  @Post('checkout')
  @Auth()
  async checkout(
    @CurrentUser('id') userId: string,
    @Body('idempotencyKey') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('idempotencyKey is required');
    }

    const orderId = await this.orderService.checkout(userId, idempotencyKey);
    return successResponse('Order created successfully', { orderId });
  }

  @Get(':orderId/timeline')
  async getOrderTimeline(@Param('orderId') orderId: string) {
    return this.orderService.getTimeline(orderId);
  }
}
