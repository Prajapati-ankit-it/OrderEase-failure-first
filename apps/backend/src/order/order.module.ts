import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaOrderRepository } from './infra/prisma-order.repository';
import { ORDER_REPOSITORY } from './infra/order.repository.interface';
import { FoodModule } from 'src/food';
import { CartModule } from 'src/cart';

@Module({
  imports: [FoodModule, CartModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [OrderService, ORDER_REPOSITORY],
})
export class OrderModule {}
