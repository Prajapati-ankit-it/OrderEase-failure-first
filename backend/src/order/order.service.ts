import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  CreateOrderDto,
  CreateOrderFromCartDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { MESSAGES } from '../constants';
import { Order, OrderItem } from './domain/order.entity';
import {
  validateOrderItems,
  validateItemQuantities,
  validateItemPrices,
  validateFoodAvailability,
  buildOrderItems,
} from './domain/order.rules';
import { OrderDomainError } from './domain/order.errors';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from './infra/order.repository.interface';
import {
  type IFoodRepository,
  FOOD_REPOSITORY,
} from '../food/infra/food.repository.interface';
import {
  type ICartRepository,
  CART_REPOSITORY,
} from '../cart/infra/cart.repository.interface';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private orderRepository: IOrderRepository,
    @Inject(FOOD_REPOSITORY)
    private foodRepository: IFoodRepository,
    @Inject(CART_REPOSITORY)
    private cartRepository: ICartRepository,
  ) {}

  /**
   * Create a new order (for logged-in users)
   */
  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto;

    try {
      // Validate items using domain rules
      const requestedItems: OrderItem[] = items.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        price: 0, // Will be set after fetching food
      }));

      validateOrderItems(requestedItems);
      validateItemQuantities(requestedItems);

      // Get available food items
      const foodItems = await this.foodRepository.findAvailableByIds(
        items.map((item) => item.foodId),
      );

      // Validate food availability
      validateFoodAvailability(
        items.map((item) => item.foodId),
        foodItems.map((f) => f.id!),
      );

      // Build order items with prices
      const foodPrices = new Map(
        foodItems.map((food) => [food.id!, food.price]),
      );

      const orderItems = buildOrderItems(
        items.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity,
        })),
        foodPrices,
      );

      validateItemPrices(orderItems);

      // Create domain order
      const order = new Order({
        userId,
        items: orderItems,
      });

      // Persist order
      return await this.orderRepository.create(order);
    } catch (error) {
      if (error instanceof OrderDomainError) {
        // Map domain errors to appropriate HTTP exceptions
        if (error.code === 'EMPTY_ORDER' || error.code === 'INVALID_QUANTITY' || error.code === 'INVALID_PRICE') {
          throw new BadRequestException(error.message);
        }
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * Create order from user's cart
   */
  async createFromCart(
    userId: string,
    createOrderFromCartDto: CreateOrderFromCartDto,
  ) {
    const { clearCart = true } = createOrderFromCartDto;

    try {
      // Get user's cart with details
      const cartData = await this.cartRepository.findByUserIdWithDetails(
        userId,
      );

      if (!cartData || cartData.cart.isEmpty()) {
        throw OrderDomainError.emptyCart();
      }

      const { cart, foodDetails } = cartData;

      // Verify all food items are still available
      const unavailableItems = cart.items.filter(
        (item) => !foodDetails.get(item.foodId)?.isAvailable,
      );
      if (unavailableItems.length > 0) {
        throw OrderDomainError.unavailableFood();
      }

      // Build order items from cart
      const foodPrices = new Map(
        Array.from(foodDetails.entries()).map(([id, details]) => [
          id,
          details.price,
        ]),
      );

      const orderItems = buildOrderItems(cart.items, foodPrices);
      validateOrderItems(orderItems);
      validateItemQuantities(orderItems);
      validateItemPrices(orderItems);

      // Create domain order
      const order = new Order({
        userId,
        items: orderItems,
      });

      // Persist order
      const createdOrder = await this.orderRepository.create(order);

      // Clear cart if requested
      if (clearCart) {
        await this.cartRepository.clearCart(userId);
      }

      return createdOrder;
    } catch (error) {
      if (error instanceof OrderDomainError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * Get all orders (Admin only)
   */
  async findAll(page = 1, limit = 10, status?: string) {
    const result = await this.orderRepository.findAll(page, limit, { status });

    return {
      orders: result.orders,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Get order by ID
   */
  async findOne(id: string) {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND);
    }

    return order;
  }

  /**
   * Update order status (Admin only)
   */
  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    await this.findOne(id); // Check if exists

    return this.orderRepository.updateStatus(id, updateStatusDto.status);
  }

  /**
   * Delete order (Admin only)
   */
  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.orderRepository.delete(id);

    return { message: 'Order deleted successfully' };
  }
}
