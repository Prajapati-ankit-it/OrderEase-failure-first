/**
 * Order Business Rules
 * Pure functions with no side effects or framework dependencies
 */

import { OrderItem } from './order.entity';
import { OrderDomainError } from '@orderease/shared-contracts';

/**
 * Validate order items are not empty
 */
export function validateOrderItems(items: OrderItem[]): void {
  if (!items || items.length === 0) {
    throw OrderDomainError.emptyOrder();
  }
}

/**
 * Validate all items have positive quantities
 */
export function validateItemQuantities(items: OrderItem[]): void {
  const invalidItems = items.filter((item) => item.quantity <= 0);
  if (invalidItems.length > 0) {
    throw OrderDomainError.invalidQuantity();
  }
}

/**
 * Validate all items have positive prices
 */
export function validateItemPrices(items: OrderItem[]): void {
  const invalidItems = items.filter((item) => item.price <= 0);
  if (invalidItems.length > 0) {
    throw OrderDomainError.invalidPrice();
  }
}

/**
 * Validate food availability
 * Checks if all requested food IDs match available food IDs
 */
export function validateFoodAvailability(
  requestedFoodIds: string[],
  availableFoodIds: string[],
): void {
  const missingIds = requestedFoodIds.filter(
    (id) => !availableFoodIds.includes(id),
  );
  if (missingIds.length > 0) {
    throw OrderDomainError.unavailableFood();
  }
}

/**
 * Build order items from cart items and food prices
 */
export function buildOrderItems(
  cartItems: Array<{ foodId: string; quantity: number }>,
  foodPrices: Map<string, number>,
): OrderItem[] {
  return cartItems.map((item) => {
    const price = foodPrices.get(item.foodId);
    if (price === undefined) {
      throw OrderDomainError.unavailableFood();
    }
    return {
      foodId: item.foodId,
      quantity: item.quantity,
      price,
    };
  });
}
