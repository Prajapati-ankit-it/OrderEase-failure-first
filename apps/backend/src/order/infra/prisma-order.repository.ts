/**
 * Prisma Order Repository Implementation
 * Infrastructure layer - contains Prisma-specific code
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { OrderEventType, OrderEventSource } from '@prisma/client';
import { IOrderRepository } from './order.repository.interface';
import { deriveOrderState, assertValidTransition, OrderState } from '../domain';

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) { }
  /**
   * Checkout - Convert user's cart into an order
   * This is an idempotent, event-driven, snapshot-based checkout function
   */
  async checkout(userId: string, idempotencyKey: string): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      // ===============================
      // Step 1: Idempotency Guard
      // ===============================
      const existingIdempotency = await tx.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });
      
      if (existingIdempotency) {
        console.log("existingIdempotency", existingIdempotency);
        return (existingIdempotency.response as { orderId: string }).orderId;
      }

      // ===============================
      // Step 2: Cart Validation
      // ===============================
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          cartItems: {
            include: {
              food: true,
            },
          },
        },
      });

      if (!cart || cart.cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const unavailableFoods = cart.cartItems.filter(
        (item) => !item.food.isAvailable,
      );

      if (unavailableFoods.length > 0) {
        throw new BadRequestException(
          `Some food items are not available: ${unavailableFoods
            .map((item) => item.food.name)
            .join(', ')}`,
        );
      }

      // ===============================
      // Step 3: Order Creation (identity only)
      // ===============================
      const order = await tx.order.create({
        data: {
          userId,
          idempotencyKey,
        },
      });

      // ===============================
      // Step 4: Snapshot OrderItems
      // ===============================
      let totalPrice = 0; // Total in cents
      let totalItemCount = 0;

      const orderItemsData = cart.cartItems.map((cartItem) => {
        // Price is already in cents, use integer arithmetic
        const itemTotal = cartItem.food.price * cartItem.quantity;
        totalPrice += itemTotal;
        totalItemCount += cartItem.quantity;

        return {
          orderId: order.id,
          foodId: cartItem.foodId,
          foodName: cartItem.food.name,
          price: cartItem.food.price, // Price in cents
          quantity: cartItem.quantity,
        };
      });

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // ===============================
      // Step 5: Order State Machine Validation
      // ===============================
      // New order has no events yet → INIT state
      let currentState: OrderState = OrderState.INIT;

      // Validate INIT → ORDER_REQUESTED
      assertValidTransition(
        currentState,
        OrderEventType.ORDER_REQUESTED,
      );

      currentState = deriveOrderState([
        { type: OrderEventType.ORDER_REQUESTED },
      ]);

      // Validate REQUESTED → ORDER_VALIDATED
      assertValidTransition(
        currentState,
        OrderEventType.ORDER_VALIDATED,
      );

      // ===============================
      // Step 6: Event Logging
      // ===============================
      await tx.orderEvent.createMany({
        data: [
          {
            orderId: order.id,
            type: OrderEventType.ORDER_REQUESTED,
            causedBy: OrderEventSource.USER,
            payload: {
              totalPrice,
              totalItemCount,
            },
          },
          {
            orderId: order.id,
            type: OrderEventType.ORDER_VALIDATED,
            causedBy: OrderEventSource.SYSTEM,
            payload: {
              totalPrice,
              totalItemCount,
            },
          },
        ],
      });

      // ===============================
      // Step 7: Persist Idempotency Result
      // ===============================
      await tx.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          requestHash: `${userId}:${cart.id}`,
          response: {
            orderId: order.id,
          },
        },
      });

      // ===============================
      // Step 8: Cleanup
      // ===============================
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order.id;
    });
  }


  async timeline(orderId: string) {
    const events = await this.prisma.orderEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: { payment: true },
    });

    if (events.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const currentState = deriveOrderState(events);

    return {
      orderId,
      currentState,
      explainable: true,
      timeline: events.map((event) => ({
        type: event.type,
        at: event.createdAt,
        by: event.causedBy,
        summary: this.describeEvent(event),
      })),
    };
  }

  private describeEvent(event: any): string {
    switch (event.type) {
      case OrderEventType.ORDER_REQUESTED:
        return 'Order placed by user';

      case OrderEventType.ORDER_VALIDATED:
        return 'Order validated and ready for payment';

      case OrderEventType.PAYMENT_INITIATED:
        return `Payment initiated via ${event.payload.provider}`;

      case OrderEventType.PAYMENT_SUCCEEDED:
        return `Payment of ₹${event.payload.amount} succeeded`;

      case OrderEventType.PAYMENT_FAILED:
        return `Payment failed`;

      case OrderEventType.ORDER_CANCELLED:
        return 'Order cancelled by user';

      case OrderEventType.PAYMENT_REFUNDED:
        return `Refund of ₹${event.payload.amount} issued`;

      default:
        return 'Unknown event';
    }
  }
}
