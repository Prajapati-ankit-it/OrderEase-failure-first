import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AddToCartDto, UpdateCartItemDto } from '@orderease/shared-contracts';
import {
  type ICartRepository,
  CART_REPOSITORY,
} from './infra/cart.repository.interface';
import {
  type IFoodRepository,
  FOOD_REPOSITORY,
} from '../food/infra/food.repository.interface';
import { FoodDomainError } from '@orderease/shared-contracts';
import { CartDomainError } from '@orderease/shared-contracts';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private cartRepository: ICartRepository,
    @Inject(FOOD_REPOSITORY)
    private foodRepository: IFoodRepository,
  ) {}

  /**
   * Get or create user's cart with items
   */
  async getCart(userId: string) {
    const cartData = await this.cartRepository.findByUserIdWithDetails(userId);

    if (!cartData) {
      // Create empty cart
      const cart = await this.cartRepository.getOrCreate(userId);
      return {
        ...cart,
        totalPrice: 0,
        itemCount: 0,
        items: [],
      };
    }

    const { cart, foodDetails } = cartData;

    // Calculate total
    const totalPrice = cart.items.reduce((sum, item) => {
      const food = foodDetails.get(item.foodId);
      return sum + (food?.price || 0) * item.quantity;
    }, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        food: foodDetails.get(item.foodId),
      })),
      totalPrice,
      itemCount: cart.items.length,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Add item to cart or update quantity if exists
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { foodId, quantity } = addToCartDto;

    try {
      // Check if food exists and is available
      const food = await this.foodRepository.findById(foodId);

      if (!food) {
        throw FoodDomainError.notFound();
      }

      if (!food.isAvailable) {
        throw FoodDomainError.unavailable();
      }

      // Add or update item in cart
      await this.cartRepository.addOrUpdateItem(userId, foodId, quantity);

      return this.getCart(userId);
    } catch (error) {
      if (error instanceof FoodDomainError) {
        if (error.code === 'FOOD_NOT_FOUND') {
          throw new NotFoundException('Food item not found');
        }
        if (error.code === 'FOOD_UNAVAILABLE') {
          throw new BadRequestException('Food item is not available');
        }
      }
      throw error;
    }
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

    try {
      // Get cart
      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart) {
        throw CartDomainError.notFound();
      }

      // Verify cart item exists and belongs to user's cart
      const cartItem = await this.cartRepository.getCartItem(itemId);

      if (!cartItem) {
        throw CartDomainError.itemNotFound();
      }

      // Verify ownership
      const ownsItem = await this.cartRepository.verifyItemOwnership(
        userId,
        itemId,
      );
      if (!ownsItem) {
        throw CartDomainError.itemNotFound();
      }

      // Update quantity (or delete if 0)
      await this.cartRepository.updateItemQuantity(userId, itemId, quantity);

      return this.getCart(userId);
    } catch (error) {
      if (error instanceof CartDomainError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, itemId: string) {
    try {
      // Get cart
      const cart = await this.cartRepository.findByUserId(userId);

      if (!cart) {
        throw CartDomainError.notFound();
      }

      // Verify cart item exists and belongs to user's cart
      const cartItem = await this.cartRepository.getCartItem(itemId);

      if (!cartItem) {
        throw CartDomainError.itemNotFound();
      }

      // Verify ownership
      const ownsItem = await this.cartRepository.verifyItemOwnership(
        userId,
        itemId,
      );
      if (!ownsItem) {
        throw CartDomainError.itemNotFound();
      }

      await this.cartRepository.removeItem(userId, itemId);

      return this.getCart(userId);
    } catch (error) {
      if (error instanceof CartDomainError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartRepository.clearCart(userId);

    return this.getCart(userId);
  }
}
