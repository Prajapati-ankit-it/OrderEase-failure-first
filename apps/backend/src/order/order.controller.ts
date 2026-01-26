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
import { Auth, CurrentUser } from '../auth/decorators';
import { Role, MESSAGES } from '@orderease/shared-contracts';
import { successResponse } from '@orderease/shared-utils';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  /**
   * Create a new order (Logged-in users)
   * POST /order
   */
  @Post()
  @Auth() // Any authenticated user can create orders
  async create(
    @CurrentUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.orderService.create(userId, createOrderDto);
    return successResponse('Order created successfully', order);
  }

  /**
   * Create order from cart (Logged-in users)
   * POST /order/from-cart
   */
  @Post('from-cart')
  @Auth() // Any authenticated user can create orders
  async createFromCart(
    @CurrentUser('id') userId: string,
    @Body() createOrderFromCartDto: CreateOrderFromCartDto,
  ) {
    const order = await this.orderService.createFromCart(
      userId,
      createOrderFromCartDto,
    );
    return successResponse('Order created from cart successfully', order);
  }

  /**
   * Get all orders (Admin only)
   * GET /order
   */
  @Get()
  @Auth(Role.ADMIN)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const result = await this.orderService.findAll(page, limit, status);
    return successResponse(MESSAGES.GENERAL.SUCCESS, result);
  }

  /**
   * Get order by ID (Admin can see all, users can see own orders)
   * GET /order/:id
   */
  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    return successResponse(MESSAGES.GENERAL.SUCCESS, order);
  }

  /**
   * Update order status (Admin only)
   * PUT /order/:id/status
   */
  @Put(':id/status')
  @Auth(Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateStatus(id, updateStatusDto);
    return successResponse('Order status updated successfully', order);
  }

  /**
   * Delete order (Admin only)
   * DELETE /order/:id
   */
  @Delete(':id')
  @Auth(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const result = await this.orderService.remove(id);
    return successResponse(result.message);
  }
}
