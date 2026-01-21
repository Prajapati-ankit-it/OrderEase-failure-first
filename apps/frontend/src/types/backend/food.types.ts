/**
 * Food module DTOs and entity types
 * Mirror backend/src/food/dto/*.ts and backend/src/food/domain/food.entity.ts
 */

/**
 * CreateFoodDto from backend/src/food/dto/food.dto.ts
 */
export interface CreateFoodDto {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable?: boolean;
}

/**
 * UpdateFoodDto from backend/src/food/dto/food.dto.ts
 */
export interface UpdateFoodDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  isAvailable?: boolean;
}

/**
 * Food entity from backend/src/food/domain/food.entity.ts
 * This is what the API returns
 */
export interface Food {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}
