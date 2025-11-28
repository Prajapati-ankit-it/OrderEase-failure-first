import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { successResponse } from '../utils';
import { MESSAGES } from '../constants';

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  /**
   * Health check endpoint
   * GET /public/health
   */
  @Get('health')
  getHealth() {
    const status = this.publicService.getHealthStatus();
    return successResponse('Service is healthy', status);
  }

  /**
   * Get menu (available food items)
   * GET /public/menu
   */
  @Get('menu')
  async getMenu(@Query('category') category?: string) {
    const menu = await this.publicService.getMenu(category);
    return successResponse(MESSAGES.GENERAL.SUCCESS, menu);
  }

  /**
   * Get food item by ID
   * GET /public/menu/:id
   */
  @Get('menu/:id')
  async getFoodById(@Param('id') id: string) {
    const food = await this.publicService.getFoodById(id);
    if (!food) {
      return successResponse(MESSAGES.GENERAL.NOT_FOUND, null);
    }
    return successResponse(MESSAGES.GENERAL.SUCCESS, food);
  }

  /**
   * Get food categories
   * GET /public/categories
   */
  @Get('categories')
  async getCategories() {
    const categories = await this.publicService.getCategories();
    return successResponse(MESSAGES.GENERAL.SUCCESS, categories);
  }
}
