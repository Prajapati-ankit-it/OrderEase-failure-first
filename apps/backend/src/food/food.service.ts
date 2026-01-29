import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateFoodDto, UpdateFoodDto } from '@orderease/shared-contracts';
import { MESSAGES } from '@orderease/shared-contracts';
import { Food } from '@orderease/shared-contracts';
import {
  type IFoodRepository,
  FOOD_REPOSITORY,
} from './infra/food.repository.interface';
import { displayToCents, centsToDisplay } from '@orderease/shared-utils';

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
      price: displayToCents(createFoodDto.price), // Convert dollars to cents
      category: createFoodDto.category,
      image: createFoodDto.image,
      isAvailable: createFoodDto.isAvailable ?? true,
    });

    const created = await this.foodRepository.create(food);
    return this.formatFoodOutput(created);
  }

  /**
   * Get all food items
   */
  async findAll(category?: string, includeUnavailable?: boolean) {
    const foods = await this.foodRepository.findAll(category, includeUnavailable);
    return foods.map(food => this.formatFoodOutput(food));
  }

  /**
   * Get food item by ID
   */
  async findOne(id: string) {
    const food = await this.foodRepository.findById(id);

    if (!food) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND);
    }

    return this.formatFoodOutput(food);
  }

  /**
   * Update food item
   */
  async update(id: string, updateFoodDto: UpdateFoodDto) {
    // Check if exists (use repository directly to avoid unnecessary conversion)
    const existing = await this.foodRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND);
    }

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
    if (updateFoodDto.price !== undefined)
      updateData.price = displayToCents(updateFoodDto.price); // Convert dollars to cents
    if (updateFoodDto.category !== undefined)
      updateData.category = updateFoodDto.category;
    if (updateFoodDto.image !== undefined)
      updateData.image = updateFoodDto.image;
    if (updateFoodDto.isAvailable !== undefined)
      updateData.isAvailable = updateFoodDto.isAvailable;

    const updated = await this.foodRepository.update(id, updateData);
    return this.formatFoodOutput(updated);
  }

  /**
   * Delete food item
   */
  async remove(id: string) {
    // Check if exists (use repository directly to avoid unnecessary conversion)
    const existing = await this.foodRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND);
    }

    await this.foodRepository.delete(id);

    return { message: 'Food item deleted successfully' };
  }

  /**
   * Format food output - convert price from cents to display format
   */
  private formatFoodOutput(food: Food) {
    return {
      ...food,
      price: centsToDisplay(food.price),
    };
  }
}
