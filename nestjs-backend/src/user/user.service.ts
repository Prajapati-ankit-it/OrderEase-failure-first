import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database';
import { UpdateProfileDto, UpdatePasswordDto } from './dto';
import { hashPassword, comparePassword } from '../utils';
import { MESSAGES } from '../constants';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

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

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              food: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
