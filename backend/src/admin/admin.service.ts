import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserRoleDto, AdminUpdateUserDto } from './dto';
import { MESSAGES } from '../constants';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../user/infra/user.repository.interface';
import {
  type IOrderRepository,
  ORDER_REPOSITORY,
} from '../order/infra/order.repository.interface';
import { User } from '../user/domain/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
    @Inject(ORDER_REPOSITORY)
    private orderRepository: IOrderRepository,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboard() {
    const [totalUsers, totalAdmins, totalOrders, recentOrdersResult] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ role: 'ADMIN' }),
        this.orderRepository.findAll(1, 1, {}).then((r) => r.total),
        this.orderRepository.findAll(1, 5, {}),
      ]);

    return {
      statistics: {
        totalUsers,
        totalAdmins,
        totalOrders,
      },
      recentOrders: recentOrdersResult.orders,
    };
  }

  /**
   * Get all users
   */
  async getAllUsers(page = 1, limit = 10) {
    const result = await this.userRepository.findAll(page, limit);

    return {
      users: result.users,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    // Get recent orders for the user
    const ordersResult = await this.orderRepository.findAll(1, 5, {
      userId: id,
    });

    return {
      ...user.toSafeUser(),
      orders: ordersResult.orders,
    };
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    const updatedUser = await this.userRepository.updateRole(
      id,
      updateUserRoleDto.role,
    );

    return updatedUser.toSafeUser();
  }

  /**
   * Update user details (admin)
   */
  async updateUser(id: string, updateUserDto: AdminUpdateUserDto) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    // Create properly typed update object
    const updateData: { name?: string; email?: string } = {};
    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }
    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }

    const updatedUser = await this.userRepository.update(id, updateData);

    return updatedUser.toSafeUser();
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    await this.userRepository.delete(id);

    return { message: MESSAGES.USER.DELETED };
  }
}
