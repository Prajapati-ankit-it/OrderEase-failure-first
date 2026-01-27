import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  UpdateUserRoleDto,
  AdminUpdateUserDto,
} from '@orderease/shared-contracts';
import { Auth, CurrentUser } from '../auth/decorators';
import { Role, MESSAGES } from '@orderease/shared-contracts';
import { successResponse } from '@orderease/shared-utils';

@Controller('admin')
@Auth(Role.ADMIN) // All routes in this controller require ADMIN role
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * Get admin dashboard
   * GET /admin/dashboard
   */
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: { id: string; role: string }) {
    // const result = await this.adminService.getDashboard();
    return successResponse(MESSAGES.ADMIN.DASHBOARD_ACCESS, {
      admin: user,
      // ...result,
    });
  }

  /**
   * Get all users
   * GET /admin/users
   */
  @Get('users')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.adminService.getAllUsers(page, limit);
    return successResponse(MESSAGES.ADMIN.USERS_FETCHED, result);
  }

  /**
   * Get user by ID
   * GET /admin/users/:id
   */
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.adminService.getUserById(id);
    return successResponse(MESSAGES.GENERAL.SUCCESS, user);
  }

  /**
   * Update user role
   * PUT /admin/users/:id/role
   */
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const user = await this.adminService.updateUserRole(id, updateUserRoleDto);
    return successResponse(MESSAGES.ADMIN.USER_ROLE_UPDATED, user);
  }

  /**
   * Update user details
   * PUT /admin/users/:id
   */
  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
  ) {
    const user = await this.adminService.updateUser(id, updateUserDto);
    return successResponse(MESSAGES.USER.PROFILE_UPDATED, user);
  }

  /**
   * Delete user
   * DELETE /admin/users/:id
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.adminService.deleteUser(id);
    return successResponse(result.message);
  }
}
