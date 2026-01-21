/**
 * Admin module DTOs
 * Mirror backend/src/admin/dto/*.ts
 */

import { Role } from './common.types';
import { SafeUser } from './user.types';
import { Order } from './order.types';

/**
 * UpdateUserRoleDto from backend/src/admin/dto/admin.dto.ts
 */
export interface UpdateUserRoleDto {
  role: Role;
}

/**
 * AdminUpdateUserDto from backend/src/admin/dto/admin.dto.ts
 */
export interface AdminUpdateUserDto {
  name?: string;
  email?: string;
  role?: Role;
}

/**
 * Admin dashboard response structure
 */
export interface AdminDashboardData {
  admin: {
    id: string;
    role: string;
  };
  totalUsers?: number;
  totalOrders?: number;
  totalRevenue?: number;
  recentOrders?: Order[];
}

/**
 * Paginated users response
 * Mirrors backend pagination structure
 */
export interface PaginatedUsers {
  users: SafeUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
