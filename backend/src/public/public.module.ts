import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { MenuController } from './menu.controller';
import { PublicService } from './public.service';
import { FoodModule } from '../food/food.module';

@Module({
  imports: [FoodModule],
  controllers: [PublicController, MenuController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
