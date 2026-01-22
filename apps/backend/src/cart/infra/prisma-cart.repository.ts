/**
 * Prisma Cart Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { Cart, CartItemProps } from '../domain/cart.entity';
import {
  ICartRepository,
  CartWithDetails,
  CartItemData,
} from './cart.repository.interface';

@Injectable()
export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const prismaCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: true,
      },
    });

    if (!prismaCart) {
      return null;
    }

    return this.toDomain(prismaCart);
  }

  async findByUserIdWithDetails(
    userId: string,
  ): Promise<CartWithDetails | null> {
    const prismaCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            food: true,
          },
        },
      },
    });

    if (!prismaCart) {
      return null;
    }

    const items: CartItemProps[] = prismaCart.cartItems.map((item) => ({
      foodId: item.foodId,
      quantity: item.quantity,
    }));

    const cart = new Cart({
      id: prismaCart.id,
      userId: prismaCart.userId,
      items,
      createdAt: prismaCart.createdAt,
      updatedAt: prismaCart.updatedAt,
    });

    const foodDetails = new Map(
      prismaCart.cartItems.map((item) => [
        item.foodId,
        {
          name: item.food.name,
          price: item.food.price,
          isAvailable: item.food.isAvailable,
        },
      ]),
    );

    return { cart, foodDetails };
  }

  async getOrCreate(userId: string): Promise<Cart> {
    let prismaCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: true,
      },
    });

    if (!prismaCart) {
      prismaCart = await this.prisma.cart.create({
        data: { userId },
        include: {
          cartItems: true,
        },
      });
    }

    return this.toDomain(prismaCart);
  }

  async addOrUpdateItem(
    userId: string,
    foodId: string,
    quantity: number,
  ): Promise<void> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      const newCart = await this.prisma.cart.create({
        data: { userId },
      });

      await this.prisma.cartItem.create({
        data: {
          cartId: newCart.id,
          foodId,
          quantity,
        },
      });
      return;
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_foodId: {
          cartId: cart.id,
          foodId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          foodId,
          quantity,
        },
      });
    }
  }

  async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<void> {
    if (quantity === 0) {
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
  }

  async getCartItem(itemId: string): Promise<CartItemData | null> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      cartId: item.cartId,
      foodId: item.foodId,
      quantity: item.quantity,
    };
  }

  async verifyItemOwnership(userId: string, itemId: string): Promise<boolean> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          where: { id: itemId },
        },
      },
    });

    return cart !== null && cart.cartItems.length > 0;
  }

  private toDomain(prismaCart: {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    cartItems: Array<{
      foodId: string;
      quantity: number;
    }>;
  }): Cart {
    const items: CartItemProps[] = prismaCart.cartItems.map((item) => ({
      foodId: item.foodId,
      quantity: item.quantity,
    }));

    return new Cart({
      id: prismaCart.id,
      userId: prismaCart.userId,
      items,
      createdAt: prismaCart.createdAt,
      updatedAt: prismaCart.updatedAt,
    });
  }
}
