/**
 * Common types shared across all backend modules
 * These types mirror the backend exactly
 */

/**
 * Role enum from backend/src/constants/index.ts
 */
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

/**
 * Standard API response format from backend/src/utils/response.util.ts
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
