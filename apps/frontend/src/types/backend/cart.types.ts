/**
 * Cart module DTOs and entity types
 * Mirror backend/src/cart/dto/*.ts and backend/src/cart/domain/cart.entity.ts
 */

/**
 * AddToCartDto from backend/src/cart/dto/cart.dto.ts
 */
export interface AddToCartDto {
  foodId: string;
  quantity: number;
}

/**
 * UpdateCartItemDto from backend/src/cart/dto/cart.dto.ts
 */
export interface UpdateCartItemDto {
  quantity: number;
}

/**
 * CartItem from backend/src/cart/domain/cart.entity.ts
 */
export interface CartItem {
  foodId: string;
  quantity: number;
}

/**
 * Cart entity from backend/src/cart/domain/cart.entity.ts
 * This is what the API returns
 */
export interface Cart {
  id?: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}
