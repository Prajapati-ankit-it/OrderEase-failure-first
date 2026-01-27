/**
 * Prisma Order Repository Implementation
 * Infrastructure layer - contains Prisma-specific code
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { OrderEventType, EventSource } from '@prisma/client';
import { IOrderRepository } from './order.repository.interface';
import {deriveOrderState, assertValidTransition, OrderState} from '../domain';

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
      let totalPrice = 0;
      let totalItemCount = 0;

      const orderItemsData = cart.cartItems.map((cartItem) => {
        const itemTotal = cartItem.food.price * cartItem.quantity;
        totalPrice += itemTotal;
        totalItemCount += cartItem.quantity;

        return {
          orderId: order.id,
          foodId: cartItem.foodId,
          foodName: cartItem.food.name,
          price: cartItem.food.price,
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
            causedBy: EventSource.USER,
            payload: {
              totalPrice,
              totalItemCount,
            },
          },
          {
            orderId: order.id,
            type: OrderEventType.ORDER_VALIDATED,
            causedBy: EventSource.SYSTEM,
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
}
