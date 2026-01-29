/**
 * Order Repository Interface
 * Defines contract for order persistence without implementation details
 * Domain layer can depend on this interface without knowing about Prisma
 */

export interface IOrderRepository {
  /**
   * Checkout - Convert user's cart into an order
   * This is an idempotent, event-driven, snapshot-based checkout function
   *
   * @param userId - The ID of the user checking out
   * @param idempotencyKey - Unique key to ensure idempotency
   * @returns The order ID (existing or newly created)
   * @throws BadRequestException if cart is empty or food items are unavailable
   */
  checkout(userId: string, idempotencyKey: string): Promise<string>;
  /**
   * Get Order Timeline - Retrieve chronological events for an order
   * @param orderId - The ID of the order
   * @returns Array of order events in chronological order
   * @throws NotFoundException if order does not exist
   */
  timeline(orderId: string): Promise<any>;
}

export const ORDER_REPOSITORY = Symbol('IOrderRepository');
