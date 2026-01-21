/**
 * Food Repository Interface
 */

import { Food } from '../domain/food.entity';

export interface FoodUpdateData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  isAvailable?: boolean;
}

export interface IFoodRepository {
  /**
   * Create a new food item
   */
  create(food: Food): Promise<Food>;

  /**
   * Find food by ID
   */
  findById(id: string): Promise<Food | null>;

  /**
   * Find multiple foods by IDs
   */
  findByIds(ids: string[]): Promise<Food[]>;

  /**
   * Find all available foods by IDs
   */
  findAvailableByIds(ids: string[]): Promise<Food[]>;

  /**
   * Find all foods with filters
   */
  findAll(category?: string, includeUnavailable?: boolean): Promise<Food[]>;

  /**
   * Update food item
   */
  update(id: string, data: FoodUpdateData): Promise<Food>;

  /**
   * Delete food item
   */
  delete(id: string): Promise<void>;
}

export const FOOD_REPOSITORY = Symbol('IFoodRepository');
