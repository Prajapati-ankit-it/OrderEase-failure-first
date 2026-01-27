/**
 * Prisma Food Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { Food } from '@orderease/shared-contracts';
import { IFoodRepository, FoodUpdateData } from './food.repository.interface';

@Injectable()
export class PrismaFoodRepository implements IFoodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(food: Food): Promise<Food> {
    const prismaFood = await this.prisma.food.create({
      data: {
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        image: food.image,
        isAvailable: food.isAvailable,
      },
    });

    return this.toDomain(prismaFood);
  }

  async findById(id: string): Promise<Food | null> {
    const prismaFood = await this.prisma.food.findUnique({
      where: { id },
    });

    if (!prismaFood) {
      return null;
    }

    return this.toDomain(prismaFood);
  }

  async findByIds(ids: string[]): Promise<Food[]> {
    const prismaFoods = await this.prisma.food.findMany({
      where: { id: { in: ids } },
    });

    return prismaFoods.map((pf) => this.toDomain(pf));
  }

  async findAvailableByIds(ids: string[]): Promise<Food[]> {
    const prismaFoods = await this.prisma.food.findMany({
      where: {
        id: { in: ids },
        isAvailable: true,
      },
    });

    return prismaFoods.map((pf) => this.toDomain(pf));
  }

  async findAll(
    category?: string,
    includeUnavailable?: boolean,
  ): Promise<Food[]> {
    const where: { category?: string; isAvailable?: boolean } = {};

    if (category) {
      where.category = category;
    }

    if (includeUnavailable === false) {
      where.isAvailable = true;
    }

    const prismaFoods = await this.prisma.food.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return prismaFoods.map((pf) => this.toDomain(pf));
  }

async update(id: string, data: FoodUpdateData): Promise<Food> {
  const prismaFood = await this.prisma.food.update({
    where: { id },
    data: Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ),
  });

  return this.toDomain(prismaFood);
}

  async delete(id: string): Promise<void> {
    await this.prisma.food.delete({
      where: { id },
    });
  }

  private toDomain(prismaFood: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    image: string | null;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Food {
    return new Food({
      id: prismaFood.id,
      name: prismaFood.name,
      description: prismaFood.description ?? undefined,
      price: prismaFood.price,
      category: prismaFood.category,
      image: prismaFood.image ?? undefined,
      isAvailable: prismaFood.isAvailable,
      createdAt: prismaFood.createdAt,
      updatedAt: prismaFood.updatedAt,
    });
  }
}
