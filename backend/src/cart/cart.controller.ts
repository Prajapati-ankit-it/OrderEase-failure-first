import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { Auth, CurrentUser } from '../auth/decorators';
import { successResponse } from '../utils';

@Controller('cart')
@Auth() // All routes require authentication
export class CartController {
  constructor(private cartService: CartService) {}

  /**
   * Get current user's cart
   * GET /cart
   */
  @Get()
  async getCart(@CurrentUser('id') userId: string) {
    const cart = await this.cartService.getCart(userId);
    return successResponse('Cart fetched successfully', cart);
  }

  /**
   * Add item to cart
   * POST /cart
   */
  @Post()
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const cart = await this.cartService.addToCart(userId, addToCartDto);
    return successResponse('Item added to cart successfully', cart);
  }

  /**
   * Update cart item quantity
   * PUT /cart/:itemId
   */
  @Put(':itemId')
  async updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.updateCartItem(
      userId,
      itemId,
      updateCartItemDto,
    );
    return successResponse('Cart item updated successfully', cart);
  }

  /**
   * Remove item from cart
   * DELETE /cart/:itemId
   */
  @Delete(':itemId')
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    const cart = await this.cartService.removeFromCart(userId, itemId);
    return successResponse('Item removed from cart successfully', cart);
  }

  /**
   * Clear cart
   * DELETE /cart
   */
  @Delete()
  async clearCart(@CurrentUser('id') userId: string) {
    const cart = await this.cartService.clearCart(userId);
    return successResponse('Cart cleared successfully', cart);
  }
}
