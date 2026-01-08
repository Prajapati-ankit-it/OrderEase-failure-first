/**
 * Prisma Food Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { Food } from '../domain/food.entity';
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
    includeUnavailable = false,
  ): Promise<Food[]> {
    const where: { category?: string; isAvailable?: boolean } = {};

    if (category) {
      where.category = category;
    }

    if (!includeUnavailable) {
      where.isAvailable = true;
    }

    const prismaFoods = await this.prisma.food.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return prismaFoods.map((pf) => this.toDomain(pf));
  }

  async update(id: string, data: FoodUpdateData): Promise<Food> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.isAvailable !== undefined)
      updateData.isAvailable = data.isAvailable;

    const prismaFood = await this.prisma.food.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(prismaFood);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.food.delete({
      where: { id },
    });
  }

  private toDomain(
    prismaFood: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      category: string;
      image: string | null;
      isAvailable: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Food {
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
