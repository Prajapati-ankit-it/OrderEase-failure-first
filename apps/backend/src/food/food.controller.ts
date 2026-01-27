import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto, UpdateFoodDto } from '@orderease/shared-contracts';
import { Auth } from '../auth/decorators';
import { Role, MESSAGES } from '@orderease/shared-contracts';
import { successResponse } from '@orderease/shared-utils';

@Controller('food')
export class FoodController {
  constructor(private foodService: FoodService) {}

  /**
   * Create a new food item (Admin only)
   * POST /food
   */
  @Post()
  @Auth(Role.ADMIN)
  async create(@Body() createFoodDto: CreateFoodDto) {
    const food = await this.foodService.create(createFoodDto);
    return successResponse('Food item created successfully', food);
  }

  /**
   * Get all food items (Admin only - includes unavailable)
   * GET /food
   */
  @Get()
  @Auth(Role.ADMIN)
  async findAll(
    @Query('category') category?: string,
    @Query('includeUnavailable') includeUnavailable: boolean = true,
  ) {
    const foods = await this.foodService.findAll(
      category,
      includeUnavailable,
    );
    return successResponse(MESSAGES.GENERAL.SUCCESS, foods);
  }

  /**
   * Get food item by ID (Admin only)
   * GET /food/:id
   */
  @Get(':id')
  @Auth(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    const food = await this.foodService.findOne(id);
    return successResponse(MESSAGES.GENERAL.SUCCESS, food);
  }

  /**
   * Update food item (Admin only)
   * PUT /food/:id
   */
  @Put(':id')
  @Auth(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    const food = await this.foodService.update(id, updateFoodDto);
    return successResponse('Food item updated successfully', food);
  }

  /**
   * Delete food item (Admin only)
   * DELETE /food/:id
   */
  @Delete(':id')
  @Auth(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const result = await this.foodService.remove(id);
    return successResponse(result.message);
  }
}
