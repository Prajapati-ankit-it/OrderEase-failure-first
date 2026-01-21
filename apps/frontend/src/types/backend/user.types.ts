/**
 * User module DTOs and entity types
 * Mirror backend/src/user/dto/*.ts and backend/src/user/domain/user.entity.ts
 */

import { Role } from './common.types';
import { Order } from './order.types';

/**
 * UpdateProfileDto from backend/src/user/dto/user.dto.ts
 */
export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

/**
 * UpdatePasswordDto from backend/src/user/dto/user.dto.ts
 */
export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * SafeUser interface from backend/src/user/domain/user.entity.ts
 * This is what the API returns (without password)
 */
export interface SafeUser {
  id?: string;
  email: string;
  name?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Paginated response for user orders
 */
export interface PaginatedUserOrders {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
