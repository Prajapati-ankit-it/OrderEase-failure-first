import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { DatabaseModule } from '../database';
import { PrismaCartRepository } from './infra/prisma-cart.repository';
import { CART_REPOSITORY } from './infra/cart.repository.interface';
import { FoodModule } from '../food/food.module';

@Module({
  imports: [DatabaseModule, FoodModule],
  controllers: [CartController],
  providers: [
    CartService,
    {
      provide: CART_REPOSITORY,
      useClass: PrismaCartRepository,
    },
  ],
  exports: [CartService, CART_REPOSITORY],
})
export class CartModule {}
