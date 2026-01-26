import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UpdateProfileDto,
  UpdatePasswordDto,
} from '@orderease/shared-contracts';
import { Auth, CurrentUser } from '../auth/decorators';
import { MESSAGES } from '@orderease/shared-contracts';
import { successResponse } from '@orderease/shared-utils';

@Controller('user')
@Auth() // All routes require authentication (USER or ADMIN)
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Get current user profile
   * GET /user/profile
   */
  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.userService.getProfile(userId);
    return successResponse(MESSAGES.USER.PROFILE_FETCHED, user);
  }

  /**
   * Update current user profile
   * PUT /user/profile
   */
  @Put('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.userService.updateProfile(userId, updateProfileDto);
    return successResponse(MESSAGES.USER.PROFILE_UPDATED, user);
  }

  /**
   * Update current user password
   * PUT /user/password
   */
  @Put('password')
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const result = await this.userService.updatePassword(
      userId,
      updatePasswordDto,
    );
    return successResponse(result.message);
  }

  /**
   * Get current user's orders
   * GET /user/orders
   */
  @Get('orders')
  async getUserOrders(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.userService.getUserOrders(userId, page, limit);
    return successResponse(MESSAGES.GENERAL.SUCCESS, result);
  }
}
