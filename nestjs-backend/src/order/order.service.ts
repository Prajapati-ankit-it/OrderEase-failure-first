import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
import { MESSAGES } from '../constants';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new order (for logged-in users)
   */
  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto;

    // Get food items and calculate total
    const foodItems = await this.prisma.food.findMany({
      where: {
        id: { in: items.map((item) => item.foodId) },
        isAvailable: true,
      },
    });

    if (foodItems.length !== items.length) {
      throw new NotFoundException('Some food items are not available');
    }

    // Calculate total price
    let totalPrice = 0;
    const orderItems = items.map((item) => {
      const food = foodItems.find((f) => f.id === item.foodId);
      if (!food) {
        throw new NotFoundException('Food item not found');
      }
      const itemTotal = food.price * item.quantity;
      totalPrice += itemTotal;
      return {
        foodId: item.foodId,
        quantity: item.quantity,
        price: food.price,
      };
    });

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalPrice,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: { food: true },
        },
      },
    });

    return order;
  }

  /**
   * Get all orders (Admin only)
   */
  async findAll(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as never } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          orderItems: {
            include: { food: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID
   */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        orderItems: {
          include: { food: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND);
    }

    return order;
  }

  /**
   * Update order status (Admin only)
   */
  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.order.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        user: { select: { id: true, email: true, name: true } },
        orderItems: {
          include: { food: true },
        },
      },
    });
  }

  /**
   * Delete order (Admin only)
   */
  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.order.delete({
      where: { id },
    });

    return { message: 'Order deleted successfully' };
  }
}
