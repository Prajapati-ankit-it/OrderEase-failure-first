import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  UpdateUserRoleDto,
  AdminUpdateUserDto,
} from '@orderease/shared-contracts';
import { MESSAGES } from '@orderease/shared-contracts';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../user/infra/user.repository.interface';

@Injectable()
export class AdminService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: IUserRepository,
  ) {}

  /**
   * Get dashboard statistics
   * NOTE: Order statistics should be fetched from order-service via API Gateway
   */
  async getDashboard() {
    const [totalUsers, totalAdmins] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ role: 'ADMIN' }),
    ]);

    return {
      statistics: {
        totalUsers,
        totalAdmins,
        totalOrders: 0, // TODO: Fetch from order-service
      },
      recentOrders: [], // TODO: Fetch from order-service
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
   * NOTE: User orders should be fetched separately from order-service
   */
  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    // TODO: Fetch orders from order-service via HTTP
    return {
      ...user.toSafeUser(),
      orders: [], // Placeholder - fetch from order-service
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
