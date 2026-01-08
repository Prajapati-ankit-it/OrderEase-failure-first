import { Module } from '@nestjs/common';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { PrismaFoodRepository } from './infra/prisma-food.repository';
import { FOOD_REPOSITORY } from './infra/food.repository.interface';

@Module({
  controllers: [FoodController],
  providers: [
    FoodService,
    {
      provide: FOOD_REPOSITORY,
      useClass: PrismaFoodRepository,
    },
  ],
  exports: [FoodService, FOOD_REPOSITORY],
})
export class FoodModule {}
