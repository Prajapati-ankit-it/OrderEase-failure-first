import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all available food items for the menu
   */
  async getMenu(category?: string) {
    const where: { isAvailable: boolean; category?: string } = {
      isAvailable: true,
    };

    if (category) {
      where.category = category;
    }

    const menuItems = await this.prisma.food.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        image: true,
      },
    });

    return menuItems;
  }

  /**
   * Get food item by ID
   */
  async getFoodById(id: string) {
    const food = await this.prisma.food.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        image: true,
        isAvailable: true,
      },
    });

    return food;
  }

  /**
   * Get list of food categories
   */
  async getCategories() {
    const foods = await this.prisma.food.findMany({
      where: { isAvailable: true },
      select: { category: true },
      distinct: ['category'],
    });

    return foods.map((f) => f.category);
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
