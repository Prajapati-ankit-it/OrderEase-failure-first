import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';
import { MESSAGES } from '../constants';
import { Food } from './domain/food.entity';
import {
  type IFoodRepository,
  FOOD_REPOSITORY,
} from './infra/food.repository.interface';

@Injectable()
export class FoodService {
  constructor(
    @Inject(FOOD_REPOSITORY)
    private foodRepository: IFoodRepository,
  ) {}

  /**
   * Create a new food item
   */
  async create(createFoodDto: CreateFoodDto) {
    const food = new Food({
      name: createFoodDto.name,
      description: createFoodDto.description,
      price: createFoodDto.price,
      category: createFoodDto.category,
      image: createFoodDto.image,
      isAvailable: createFoodDto.isAvailable ?? true,
    });

    return this.foodRepository.create(food);
  }

  /**
   * Get all food items
   */
  async findAll(category?: string, includeUnavailable = false) {
    return this.foodRepository.findAll(category, includeUnavailable);
  }

  /**
   * Get food item by ID
   */
  async findOne(id: string) {
    const food = await this.foodRepository.findById(id);

    if (!food) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND);
    }

    return food;
  }

  /**
   * Update food item
   */
  async update(id: string, updateFoodDto: UpdateFoodDto) {
    await this.findOne(id); // Check if exists

    // Create properly typed update object
    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      image?: string;
      isAvailable?: boolean;
    } = {};

    if (updateFoodDto.name !== undefined) updateData.name = updateFoodDto.name;
    if (updateFoodDto.description !== undefined)
      updateData.description = updateFoodDto.description;
    if (updateFoodDto.price !== undefined) updateData.price = updateFoodDto.price;
    if (updateFoodDto.category !== undefined)
      updateData.category = updateFoodDto.category;
    if (updateFoodDto.image !== undefined) updateData.image = updateFoodDto.image;
    if (updateFoodDto.isAvailable !== undefined)
      updateData.isAvailable = updateFoodDto.isAvailable;

    return this.foodRepository.update(id, updateData);
  }

  /**
   * Delete food item
   */
  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.foodRepository.delete(id);

    return { message: 'Food item deleted successfully' };
  }
}
