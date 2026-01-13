/**
 * Order module DTOs and entity types
 * Mirror backend/src/order/dto/*.ts and backend/src/order/domain/order.entity.ts
 */

/**
 * OrderStatus enum from backend/src/order/dto/order.dto.ts and backend/src/order/domain/order.entity.ts
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

/**
 * CreateOrderItemDto from backend/src/order/dto/order.dto.ts
 */
export interface CreateOrderItemDto {
  foodId: string;
  quantity: number;
}

/**
 * CreateOrderDto from backend/src/order/dto/order.dto.ts
 */
export interface CreateOrderDto {
  items: CreateOrderItemDto[];
}

/**
 * CreateOrderFromCartDto from backend/src/order/dto/order.dto.ts
 */
export interface CreateOrderFromCartDto {
  clearCart?: boolean;
}

/**
 * UpdateOrderStatusDto from backend/src/order/dto/order.dto.ts
 */
export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

/**
 * OrderItem from backend/src/order/domain/order.entity.ts
 */
export interface OrderItem {
  foodId: string;
  quantity: number;
  price: number;
}

/**
 * Order entity from backend/src/order/domain/order.entity.ts
 * This is what the API returns
 */
export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Paginated orders response
 */
export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
