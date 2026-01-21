import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaUserRepository } from './infra/prisma-user.repository';
import { USER_REPOSITORY } from './infra/user.repository.interface';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [OrderModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
