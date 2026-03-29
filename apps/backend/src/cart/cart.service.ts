import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
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
import { centsToDisplay } from '@orderease/shared-utils';
import { RedisService } from './redis.service';
import {
  RedisCart,
  RedisCartItem,
  mapDbCartToRedisCart,
  mapRedisCartToDbCartItems,
  getCartRedisKey,
  isRedisCartEmpty,
  addItemInRedisCart,
  updateItemInRedisCart,
  removeItemFromRedisCart,
  clearRedisCart,
} from './cart-transformers';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @Inject(CART_REPOSITORY)
    private cartRepository: ICartRepository,
    @Inject(FOOD_REPOSITORY)
    private foodRepository: IFoodRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Get or create user's cart with items
   * Hybrid implementation: Try Redis first, fallback to DB
   */
  async getCart(userId: string) {
    const redisKey = getCartRedisKey(userId);
    
    // Step 1: Try Redis first
    if (this.redisService.isAvailable()) {
      try {
        const redisCart = await this.redisService.get(redisKey);
        
        if (redisCart && !isRedisCartEmpty(redisCart)) {
          this.logger.debug(`Cart cache hit for user ${userId}`);
          
          // Transform Redis cart to expected format
          const totalPriceCents = redisCart.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
          }, 0);

          return {
            id: redisCart.cartId || 'redis-cart', // Use real cart ID from Redis
            userId,
            items: redisCart.items.map((item) => ({
              foodId: item.foodId,
              quantity: item.quantity,
              food: {
                id: item.foodId,
                name: item.name,
                price: centsToDisplay(item.price),
                description: '',
                imageUrl: '',
                isAvailable: true,
                category: '',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })),
            totalPrice: centsToDisplay(totalPriceCents),
            itemCount: redisCart.items.length,
            createdAt: new Date(redisCart.updatedAt),
            updatedAt: new Date(redisCart.updatedAt),
          };
        }
      } catch (error) {
        this.logger.warn(`Redis read failed for user ${userId}, falling back to DB`, error);
      }
    }

    // Step 2: Redis MISS or Redis unavailable - fetch from DB
    this.logger.debug(`Cart cache miss for user ${userId}, fetching from DB`);
    const cartData = await this.cartRepository.findByUserIdWithDetails(userId);

    if (!cartData) {
      // Create empty cart
      const cart = await this.cartRepository.getOrCreate(userId);
      
      // Cache empty cart in Redis
      if (this.redisService.isAvailable()) {
        try {
          const emptyRedisCart: RedisCart = {
            cartId: cart.id || 'empty-cart', // Store real cart ID or placeholder
            items: [],
            updatedAt: new Date().toISOString(),
          };
          await this.redisService.set(redisKey, emptyRedisCart);
        } catch (error) {
          this.logger.warn(`Failed to cache empty cart for user ${userId}`, error);
        }
      }

      return {
        ...cart,
        totalPrice: 0,
        itemCount: 0,
        items: [],
      };
    }

    const { cart, foodDetails } = cartData;

    // Calculate total in cents (integer arithmetic)
    const totalPriceCents = cart.items.reduce((sum, item) => {
      const food = foodDetails.get(item.foodId);
      return sum + (food?.price || 0) * item.quantity;
    }, 0);

    const result = {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => {
        const food = foodDetails.get(item.foodId);
        return {
          foodId: item.foodId,
          quantity: item.quantity,
          food: food ? {
            ...food,
            price: centsToDisplay(food.price), // Convert to display format
          } : undefined,
        };
      }),
      totalPrice: centsToDisplay(totalPriceCents), // Convert to display format
      itemCount: cart.items.length,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    // Step 3: Hydrate Redis with DB data
    if (this.redisService.isAvailable()) {
      try {
        const redisCart = mapDbCartToRedisCart({
          id: cart.id || '',
          userId: cart.userId || '',
          createdAt: cart.createdAt || new Date(),
          updatedAt: cart.updatedAt || new Date(),
          items: cart.items || [],
        });
        if (redisCart) {
          await this.redisService.set(redisKey, redisCart);
          this.logger.debug(`Cached cart for user ${userId} in Redis`);
        }
      } catch (error) {
        this.logger.warn(`Failed to cache cart for user ${userId}`, error);
      }
    }

    return result;
  }

  /**
   * Add item to cart or update quantity if exists
   * Hybrid implementation: Update Redis first, then DB
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { foodId, quantity } = addToCartDto;
    const redisKey = getCartRedisKey(userId);

    try {
      // Check if food exists and is available
      const food = await this.foodRepository.findById(foodId);

      if (!food) {
        throw FoodDomainError.notFound();
      }

      if (!food.isAvailable) {
        throw FoodDomainError.unavailable();
      }

      // Step 1: Update Redis first
      if (this.redisService.isAvailable()) {
        try {
          let redisCart = await this.redisService.get(redisKey);
          
          // Add item to Redis cart
          redisCart = addItemInRedisCart(
            redisCart,
            foodId,
            food.name,
            food.price,
            quantity,
          );

          // Set in Redis with TTL
          await this.redisService.set(redisKey, redisCart);
        } catch (error) {
          this.logger.warn(`Failed to update Redis cart for user ${userId}`, error);
        }
      }

      // Step 2: Mark cart as dirty for async sync (REMOVED direct DB write)
      if (this.redisService.isAvailable()) {
        try {
          await this.redisService.set(`cart:dirty:${userId}`, true, 7 * 24 * 60 * 60); // 7 days TTL
          await this.redisService.sadd('cart:dirty_users', userId);
        } catch (error) {
          this.logger.warn(`Failed to mark cart as dirty for user ${userId}`, error);
        }
      }

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
   * Hybrid implementation: Update Redis first, then DB
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { quantity } = updateCartItemDto;
    const redisKey = getCartRedisKey(userId);

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

      // Step 1: Update Redis first
      if (this.redisService.isAvailable()) {
        try {
          let redisCart = await this.redisService.get(redisKey);
          
          if (redisCart) {
            // Update item in Redis cart
            redisCart = updateItemInRedisCart(redisCart, cartItem.foodId, quantity);
            
            // Set in Redis with TTL
            await this.redisService.set(redisKey, redisCart);
            this.logger.debug(`Updated Redis cart for user ${userId} - updated item ${cartItem.foodId}`);
          }
        } catch (error) {
          this.logger.warn(`Failed to update Redis cart for user ${userId}`, error);
        }
      }

      // Step 2: Mark cart as dirty for async sync (REMOVED direct DB write)
      if (this.redisService.isAvailable()) {
        try {
          await this.redisService.set(`cart:dirty:${userId}`, true, 7 * 24 * 60 * 60); // 7 days TTL
          await this.redisService.sadd('cart:dirty_users', userId);
        } catch (error) {
          this.logger.warn(`Failed to mark cart as dirty for user ${userId}`, error);
        }
      }

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
   * Hybrid implementation: Update Redis first, then DB
   */
  async removeFromCart(userId: string, itemId: string) {
    const redisKey = getCartRedisKey(userId);

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

      // Step 1: Update Redis first
      if (this.redisService.isAvailable()) {
        try {
          let redisCart = await this.redisService.get(redisKey);
          
          if (redisCart) {
            // Remove item from Redis cart
            redisCart = removeItemFromRedisCart(redisCart, cartItem.foodId);
            
            // Set in Redis with TTL
            await this.redisService.set(redisKey, redisCart);
            this.logger.debug(`Updated Redis cart for user ${userId} - removed item ${cartItem.foodId}`);
          }
        } catch (error) {
          this.logger.warn(`Failed to update Redis cart for user ${userId}`, error);
        }
      }

      // Step 2: Mark cart as dirty for async sync (REMOVED direct DB write)
      if (this.redisService.isAvailable()) {
        try {
          await this.redisService.set(`cart:dirty:${userId}`, true, 7 * 24 * 60 * 60); // 7 days TTL
          await this.redisService.sadd('cart:dirty_users', userId);
        } catch (error) {
          this.logger.warn(`Failed to mark cart as dirty for user ${userId}`, error);
        }
      }

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
   * Hybrid implementation: Clear Redis first, then DB
   */
  async clearCart(userId: string) {
    const redisKey = getCartRedisKey(userId);

    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Step 1: Clear Redis first
    if (this.redisService.isAvailable()) {
      try {
        let emptyRedisCart = clearRedisCart();
        
        // Preserve cartId for consistency
        emptyRedisCart.cartId = cart.id || 'cleared-cart';
        
        await this.redisService.set(redisKey, emptyRedisCart);
      } catch (error) {
        this.logger.warn(`Failed to clear Redis cart for user ${userId}`, error);
      }
    }

    // Step 2: Mark cart as dirty for async sync (REMOVED direct DB write)
    if (this.redisService.isAvailable()) {
      try {
        await this.redisService.set(`cart:dirty:${userId}`, true, 7 * 24 * 60 * 60); // 7 days TTL
        await this.redisService.sadd('cart:dirty_users', userId);
      } catch (error) {
        this.logger.warn(`Failed to mark cart as dirty for user ${userId}`, error);
      }
    }

    return this.getCart(userId);
  }
}
