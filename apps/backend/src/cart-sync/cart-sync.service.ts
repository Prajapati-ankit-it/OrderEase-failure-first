import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { RedisService } from '../cart/redis.service';
import { getCartRedisKey } from '../cart/cart-transformers';

@Injectable()
export class CartSyncService {
  private readonly logger = new Logger(CartSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Sync all dirty carts from Redis to PostgreSQL
   */
  async syncDirtyCarts(): Promise<{ synced: number; failed: number }> {
    const dirtyUsers = await this.redisService.smembers('cart:dirty_users');
    
    if (dirtyUsers.length === 0) {
      this.logger.debug('No dirty carts to sync');
      return { synced: 0, failed: 0 };
    }

    this.logger.log(`Found ${dirtyUsers.length} dirty carts to sync`);
    
    let synced = 0;
    let failed = 0;

    for (const userId of dirtyUsers) {
      try {
        const success = await this.syncCartForUser(userId);
        if (success) {
          synced++;
          await this.redisService.srem('cart:dirty_users', userId);
        } else {
          failed++;
        }
      } catch (error) {
        this.logger.error(`Failed to sync cart for user ${userId}`, error);
        failed++;
      }
    }

    this.logger.log(`Cart sync completed: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }

  /**
   * Sync a single user's cart from Redis to PostgreSQL
   */
  private async syncCartForUser(userId: string): Promise<boolean> {
    try {
      const redisKey = getCartRedisKey(userId);
      const redisCart = await this.redisService.get(redisKey);

      if (!redisCart) {
        this.logger.warn(`No cart found in Redis for user ${userId}`);
        return true; // Nothing to sync, remove from dirty set
      }

      // Check if cart is empty
      if (!redisCart.items || redisCart.items.length === 0) {
        await this.clearCartInDb(userId);
        return true;
      }

      // Transform Redis cart to DB format
      const dbCartData = this.mapRedisCartToDb(redisCart, userId);

      // Sync to database with transaction
      await this.prisma.$transaction(async (tx) => {
        // Upsert cart
        await tx.cart.upsert({
          where: { userId },
          update: {
            updatedAt: new Date(),
          },
          create: {
            id: redisCart.cartId || undefined,
            userId,
            createdAt: new Date(redisCart.updatedAt),
            updatedAt: new Date(redisCart.updatedAt),
          },
        });

        // Delete existing cart items
        await tx.cartItem.deleteMany({
          where: { cart: { userId } },
        });

        // Insert new cart items
        if (dbCartData.items.length > 0) {
          await tx.cartItem.createMany({
            data: dbCartData.items,
          });
        }
      });

      this.logger.debug(`Successfully synced cart for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to sync cart for user ${userId}`, error);
      return false;
    }
  }

  /**
   * Clear cart in database (remove all items)
   */
  private async clearCartInDb(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Ensure cart exists
      await tx.cart.upsert({
        where: { userId },
        update: { updatedAt: new Date() },
        create: {
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Delete all cart items
      await tx.cartItem.deleteMany({
        where: { cart: { userId } },
      });
    });
  }

  /**
   * Transform Redis cart to DB format
   */
  private mapRedisCartToDb(redisCart: any, userId: string): {
    cart: any;
    items: any[];
  } {
    const cart = {
      id: redisCart.cartId || undefined,
      userId,
      createdAt: new Date(redisCart.updatedAt),
      updatedAt: new Date(redisCart.updatedAt),
    };

    const items = redisCart.items.map((item: any) => ({
      foodId: item.foodId,
      quantity: item.quantity,
      price: item.price, // Store price in cents
    }));

    return { cart, items };
  }
}
