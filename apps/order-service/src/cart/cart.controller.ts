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
import { AddToCartDto, UpdateCartItemDto } from '@orderease/shared-dtos';
import { UserId } from '../common/decorators';
import { successResponse } from '@orderease/shared-utils';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  /**
   * Get current user's cart
   * GET /cart
   * Note: API Gateway handles authentication and sets x-user-id header
   */
  @Get()
  async getCart(@UserId() userId: string) {
    const cart = await this.cartService.getCart(userId);
    return successResponse('Cart fetched successfully', cart);
  }

  /**
   * Add item to cart
   * POST /cart
   * Note: API Gateway handles authentication and sets x-user-id header
   */
  @Post()
  async addToCart(
    @UserId() userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const cart = await this.cartService.addToCart(userId, addToCartDto);
    return successResponse('Item added to cart successfully', cart);
  }

  /**
   * Update cart item quantity
   * PUT /cart/:itemId
   * Note: API Gateway handles authentication and sets x-user-id header
   */
  @Put(':itemId')
  async updateCartItem(
    @UserId() userId: string,
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
   * Note: API Gateway handles authentication and sets x-user-id header
   */
  @Delete(':itemId')
  async removeFromCart(
    @UserId() userId: string,
    @Param('itemId') itemId: string,
  ) {
    const cart = await this.cartService.removeFromCart(userId, itemId);
    return successResponse('Item removed from cart successfully', cart);
  }

  /**
   * Clear cart
   * DELETE /cart
   * Note: API Gateway handles authentication and sets x-user-id header
   */
  @Delete()
  async clearCart(@UserId() userId: string) {
    const cart = await this.cartService.clearCart(userId);
    return successResponse('Cart cleared successfully', cart);
  }
}
