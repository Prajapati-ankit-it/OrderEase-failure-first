import { Injectable, Inject } from '@nestjs/common';
import {
  type IFoodRepository,
  FOOD_REPOSITORY,
} from '../food/infra/food.repository.interface';

@Injectable()
export class PublicService {
  constructor(
    @Inject(FOOD_REPOSITORY)
    private foodRepository: IFoodRepository,
  ) {}

  /**
   * Get all available food items for the menu
   */
  async getMenu(category?: string) {
    const menuItems = await this.foodRepository.findAll(category, false);

    return menuItems.map((food) => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
    }));
  }

  /**
   * Get food item by ID
   */
  async getFoodById(id: string) {
    const food = await this.foodRepository.findById(id);

    if (!food) {
      return null;
    }

    return {
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
      isAvailable: food.isAvailable,
    };
  }

  /**
   * Get list of food categories
   */
  async getCategories() {
    const foods = await this.foodRepository.findAll(undefined, false);

    // Get unique categories
    const categories = new Set(foods.map((f) => f.category));

    return Array.from(categories);
  }

  /**
   * Health check endpoint
   */
  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'OrderEase API',
      version: '1.0.0',
    };
  }
}
