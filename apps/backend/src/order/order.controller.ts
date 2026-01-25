import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  CreateOrderFromCartDto,
  UpdateOrderStatusDto,
} from '@orderease/shared-contracts';
import { UserId } from '../common/decorators';
import { MESSAGES } from '@orderease/shared-contracts';
import { successResponse } from '@orderease/shared-utils';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  /**
   * Create a new order (Logged-in users)
   * POST /order
   * Note: API Gateway handles authentication and sets x-user-id header
   */
  @Post()
  async create(
    @UserId() userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.orderService.create(userId, createOrderDto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return successResponse('Order created successfully', order);
  }

  /**
   * Create order from cart (Logged-in users)
   * POST /order/from-cart
   * Note: API Gateway handles authentication and sets x-user-id header
   */
  @Post('from-cart')
  async createFromCart(
    @UserId() userId: string,
    @Body() createOrderFromCartDto: CreateOrderFromCartDto,
  ) {
    const order = await this.orderService.createFromCart(
      userId,
      createOrderFromCartDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return successResponse('Order created from cart successfully', order);
  }

  /**
   * Get all orders (Admin only)
   * GET /order
   * Note: API Gateway enforces admin role
   */
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const result = await this.orderService.findAll(page, limit, status);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return successResponse(MESSAGES.GENERAL.SUCCESS, result);
  }

  /**
   * Get order by ID (Admin can see all, users can see own orders)
   * GET /order/:id
   * Note: API Gateway handles authentication and authorization
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return successResponse(MESSAGES.GENERAL.SUCCESS, order);
  }

  /**
   * Update order status (Admin only)
   * PUT /order/:id/status
   * Note: API Gateway enforces admin role
   */
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateStatus(id, updateStatusDto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return successResponse('Order status updated successfully', order);
  }

  /**
   * Delete order (Admin only)
   * DELETE /order/:id
   * Note: API Gateway enforces admin role
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.orderService.remove(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return successResponse(result.message);
  }
}
