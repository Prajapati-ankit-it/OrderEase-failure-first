import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { successResponse } from '@orderease/shared-utils';
import { MESSAGES } from '@orderease/shared-contracts';

@Controller('menu')
export class MenuController {
  constructor(private publicService: PublicService) {}

  /**
   * Get menu (available food items)
   * GET /api/menu?available=true
   *
   * Note: The 'available' parameter is accepted for API compatibility but
   * this public endpoint always returns only available items for security.
   */
  @Get()
  async getMenu(
    @Query('available') _available?: string,
    @Query('category') category?: string,
  ) {
    // The _available parameter is accepted but not used - this endpoint
    // always returns only available items for this public endpoint
    const menu = await this.publicService.getMenu(category);
    return successResponse(MESSAGES.GENERAL.SUCCESS, menu);
  }

  /**
   * Get food item by ID
   * GET /api/menu/:id
   */
  @Get(':id')
  async getFoodById(@Param('id') id: string) {
    const food = await this.publicService.getFoodById(id);
    if (!food) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND);
    }
    return successResponse(MESSAGES.GENERAL.SUCCESS, food);
  }
}
