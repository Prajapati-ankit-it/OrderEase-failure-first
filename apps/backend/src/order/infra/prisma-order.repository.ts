// /**
//  * Prisma Order Repository Implementation
//  * Infrastructure layer - contains Prisma-specific code
//  */

// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '@orderease/shared-database';
// import { Order, OrderStatus, OrderItem } from '../domain/order.entity';
// import {
//   IOrderRepository,
//   OrderListFilter,
//   OrderListResult,
// } from './order.repository.interface';
// import { OrderStatus as PrismaOrderStatus } from '@prisma/client';

// @Injectable()
// export class PrismaOrderRepository implements IOrderRepository {
//   constructor(private readonly prisma: PrismaService) {}

//   /**
//    * Create a new order
//    */
//   async create(order: Order): Promise<Order> {
//     const totalPrice = order.calculateTotal();

//     const prismaOrder = await this.prisma.order.create({
//       data: {
//         userId: order.userId,
//         totalPrice,
//         status: order.status as PrismaOrderStatus,
//         orderItems: {
//           create: order.items.map((item) => ({
//             foodId: item.foodId,
//             quantity: item.quantity,
//             price: item.price,
//           })),
//         },
//       },
//       include: {
//         orderItems: true,
//       },
//     });

//     return this.toDomain(prismaOrder);
//   }

//   /**
//    * Find order by ID
//    */
//   async findById(id: string): Promise<Order | null> {
//     const prismaOrder = await this.prisma.order.findUnique({
//       where: { id },
//       include: {
//         orderItems: true,
//       },
//     });

//     if (!prismaOrder) {
//       return null;
//     }

//     return this.toDomain(prismaOrder);
//   }

//   /**
//    * Find orders with pagination and filters
//    */
//   async findAll(
//     page: number,
//     limit: number,
//     filter?: OrderListFilter,
//   ): Promise<OrderListResult> {
//     const skip = (page - 1) * limit;
//     const where: { status?: PrismaOrderStatus; userId?: string } = {};

//     if (filter?.status) {
//       where.status = filter.status as PrismaOrderStatus;
//     }

//     if (filter?.userId) {
//       where.userId = filter.userId;
//     }

//     const [prismaOrders, total] = await Promise.all([
//       this.prisma.order.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//         include: {
//           orderItems: true,
//         },
//       }),
//       this.prisma.order.count({ where }),
//     ]);

//     const orders = prismaOrders.map((po) => this.toDomain(po));

//     return { orders, total };
//   }

//   /**
//    * Update order status
//    */
//   async updateStatus(id: string, status: string): Promise<Order> {
//     const prismaOrder = await this.prisma.order.update({
//       where: { id },
//       data: { status: status as PrismaOrderStatus },
//       include: {
//         orderItems: true,
//       },
//     });

//     return this.toDomain(prismaOrder);
//   }

//   /**
//    * Delete order by ID
//    */
//   async delete(id: string): Promise<void> {
//     await this.prisma.order.delete({
//       where: { id },
//     });
//   }

//   /**
//    * Map Prisma model to Domain entity
//    * This is where we isolate Prisma from domain
//    */
//   private toDomain(prismaOrder: {
//     id: string;
//     userId: string;
//     totalPrice: number;
//     status: PrismaOrderStatus;
//     createdAt: Date;
//     updatedAt: Date;
//     orderItems: Array<{
//       foodId: string;
//       quantity: number;
//       price: number;
//     }>;
//   }): Order {
//     const items: OrderItem[] = prismaOrder.orderItems.map((item) => ({
//       foodId: item.foodId,
//       quantity: item.quantity,
//       price: item.price,
//     }));

//     return new Order({
//       id: prismaOrder.id,
//       userId: prismaOrder.userId,
//       items,
//       status: prismaOrder.status as OrderStatus,
//       createdAt: prismaOrder.createdAt,
//       updatedAt: prismaOrder.updatedAt,
//     });
//   }
// }
