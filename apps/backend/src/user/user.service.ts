import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateProfileDto, UpdatePasswordDto } from '@orderease/shared-contracts';
import { hashPassword, comparePassword } from '@orderease/shared-utils';
import { MESSAGES } from '@orderease/shared-contracts';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from './infra/user.repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
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

    const updatedUser = await this.userRepository.update(userId, updateData);

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
   * Get user orders
   * NOTE: This now returns empty results. Orders should be fetched via API Gateway
   * from the order-service at /api/order endpoint
   */
  async getUserOrders(userId: string, page = 1, limit = 10) {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Call order-service via HTTP to get orders
    // For now, return empty result to maintain API compatibility
    return {
      orders: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
}
