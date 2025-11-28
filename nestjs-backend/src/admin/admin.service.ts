import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database';
import { UpdateUserRoleDto, AdminUpdateUserDto } from './dto';
import { MESSAGES } from '../constants';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   */
  async getDashboard() {
    const [totalUsers, totalAdmins, totalOrders, recentOrders] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.order.count(),
        this.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        }),
      ]);

    return {
      statistics: {
        totalUsers,
        totalAdmins,
        totalOrders,
      },
      recentOrders,
    };
  }

  /**
   * Get all users
   */
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    return user;
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: updateUserRoleDto.role },
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
   * Update user details (admin)
   */
  async updateUser(id: string, updateUserDto: AdminUpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
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
   * Delete user
   */
  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: MESSAGES.USER.DELETED };
  }
}
