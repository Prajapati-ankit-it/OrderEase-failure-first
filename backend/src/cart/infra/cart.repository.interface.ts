/**
 * Cart Repository Interface
 */

import { Cart } from '../domain/cart.entity';

export interface CartWithDetails {
  cart: Cart;
  foodDetails: Map<
    string,
    { name: string; price: number; isAvailable: boolean }
  >;
}

export interface CartItemData {
  id: string;
  cartId: string;
  foodId: string;
  quantity: number;
}

export interface ICartRepository {
  /**
   * Find cart by user ID
   */
  findByUserId(userId: string): Promise<Cart | null>;

  /**
   * Find cart with food details
   */
  findByUserIdWithDetails(userId: string): Promise<CartWithDetails | null>;

  /**
   * Get or create cart for user
   */
  getOrCreate(userId: string): Promise<Cart>;

  /**
   * Add or update item in cart
   */
  addOrUpdateItem(userId: string, foodId: string, quantity: number): Promise<void>;

  /**
   * Update cart item quantity
   */
  updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<void>;

  /**
   * Remove item from cart
   */
  removeItem(userId: string, itemId: string): Promise<void>;

  /**
   * Clear all items from cart
   */
  clearCart(userId: string): Promise<void>;

  /**
   * Get cart item by ID
   */
  getCartItem(itemId: string): Promise<CartItemData | null>;

  /**
   * Verify cart item belongs to user's cart
   */
  verifyItemOwnership(userId: string, itemId: string): Promise<boolean>;
}

export const CART_REPOSITORY = Symbol('ICartRepository');
