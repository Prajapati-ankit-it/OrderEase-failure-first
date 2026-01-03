import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create user's cart with items
   */
  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            food: true,
          },
        },
      },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          cartItems: {
            include: {
              food: true,
            },
          },
        },
      });
    }

    // Calculate total
    const totalPrice = cart.cartItems.reduce((sum, item) => {
      return sum + item.food.price * item.quantity;
    }, 0);

    return {
      ...cart,
      totalPrice,
      itemCount: cart.cartItems.length,
    };
  }

  /**
   * Add item to cart or update quantity if exists
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { foodId, quantity } = addToCartDto;

    // Check if food exists and is available
    const food = await this.prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      throw new NotFoundException('Food item not found');
    }

    if (!food.isAvailable) {
      throw new BadRequestException('Food item is not available');
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_foodId: {
          cartId: cart.id,
          foodId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          foodId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { quantity } = updateCartItemDto;

    // Get cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Verify cart item belongs to user's cart
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, itemId: string) {
    // Get cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Verify cart item belongs to user's cart
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }
}
