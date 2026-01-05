import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { successResponse } from '../utils';
import { MESSAGES } from '../constants';

@Controller('menu')
export class MenuController {
  constructor(private publicService: PublicService) {}

  /**
   * Get menu (available food items)
   * GET /api/menu?available=true
   */
  @Get()
  async getMenu(
    @Query('available') available?: string,
    @Query('category') category?: string,
  ) {
    // If available is explicitly set to false, we still only show available items
    // for this public endpoint (security/business logic)
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
