import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';
import { CreateFoodDto, UpdateFoodDto } from './food.dto';
import { MESSAGES } from '../constants';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new food item
   */
  async create(createFoodDto: CreateFoodDto) {
    return this.prisma.food.create({
      data: createFoodDto,
    });
  }

  /**
   * Get all food items
   */
  async findAll(category?: string, includeUnavailable = false) {
    const where: { category?: string; isAvailable?: boolean } = {};

    if (category) {
      where.category = category;
    }

    if (!includeUnavailable) {
      where.isAvailable = true;
    }

    return this.prisma.food.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get food item by ID
   */
  async findOne(id: string) {
    const food = await this.prisma.food.findUnique({
      where: { id },
    });

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

    return this.prisma.food.update({
      where: { id },
      data: updateFoodDto,
    });
  }

  /**
   * Delete food item
   */
  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.food.delete({
      where: { id },
    });

    return { message: 'Food item deleted successfully' };
  }
}
