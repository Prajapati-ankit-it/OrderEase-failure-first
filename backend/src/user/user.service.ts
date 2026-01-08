import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateProfileDto, UpdatePasswordDto } from './dto';
import { hashPassword, comparePassword } from '../utils';
import { MESSAGES } from '../constants';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from './infra/user.repository.interface';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from '../order/infra/order.repository.interface';
import { User } from './domain/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
    @Inject(ORDER_REPOSITORY)
    private orderRepository: IOrderRepository,
  ) {}

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    return user.toSafeUser();
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    // Create a properly typed update object
    const updateData: { name?: string } = {};
    if (updateProfileDto.name !== undefined) {
      updateData.name = updateProfileDto.name;
    }

    const updatedUser = await this.userRepository.update(userId, updateData as Partial<User>);

    return updatedUser.toSafeUser();
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Hash new password
    const hashedPassword = await hashPassword(updatePasswordDto.newPassword);

    await this.userRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password updated successfully' };
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, page = 1, limit = 10) {
    const result = await this.orderRepository.findAll(page, limit, {
      userId,
    });

    return {
      orders: result.orders,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
