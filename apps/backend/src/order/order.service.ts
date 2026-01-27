import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { OrderEventType, EventSource } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Checkout - Convert user's cart into an order
   * This is an idempotent, event-driven, snapshot-based checkout function
   */
  async checkout(userId: string, idempotencyKey: string): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      // Step 1: Idempotency Guard
      const existingOrder = await tx.order.findUnique({
        where: { idempotencyKey },
      });

      if (existingOrder) {
        // Return existing order ID without creating anything new
        return existingOrder.id;
      }

      // Step 2: Cart Validation
      // Fetch the cart belonging to the user
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

      // Validate that all foods are available
      const unavailableFoods = cart.cartItems.filter(
        (item) => !item.food.isAvailable,
      );

      if (unavailableFoods.length > 0) {
        throw new BadRequestException(
          `Some food items are not available: ${unavailableFoods.map((item) => item.food.name).join(', ')}`,
        );
      }

      // Step 3: Order Creation
      const order = await tx.order.create({
        data: {
          userId,
          idempotencyKey,
        },
      });

      // Step 4: Snapshot OrderItems
      // Create order items by copying food name and price from Food table
      // Note: Using Float for prices as defined in schema. For production,
      // consider using Decimal type or storing prices in cents as integers
      let totalPrice = 0;
      const totalItemCount = cart.cartItems.length;

      const orderItemsData = cart.cartItems.map((cartItem) => {
        const itemTotal = cartItem.food.price * cartItem.quantity;
        totalPrice += itemTotal;

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

      // Step 5: Event Logging
      // Create ORDER_REQUESTED event
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: OrderEventType.ORDER_REQUESTED,
          causedBy: EventSource.USER,
          payload: {
            totalPrice,
            totalItemCount,
          },
        },
      });

      // Create ORDER_VALIDATED event
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: OrderEventType.ORDER_VALIDATED,
          causedBy: EventSource.SYSTEM,
          payload: {
            totalPrice,
            totalItemCount,
          },
        },
      });

      // Step 6: Cleanup
      // Delete all cart items for this cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order.id;
    });
  }
}
