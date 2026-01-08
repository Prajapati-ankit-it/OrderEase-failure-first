/**
 * User Repository Interface
 */

import { User, SafeUser } from '../domain/user.entity';

export interface UserUpdateData {
  name?: string;
  email?: string;
}

export interface IUserRepository {
  /**
   * Create a new user
   */
  create(user: User): Promise<User>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users with pagination
   */
  findAll(page: number, limit: number): Promise<{ users: SafeUser[]; total: number }>;

  /**
   * Update user
   */
  update(id: string, data: UserUpdateData): Promise<User>;

  /**
   * Update user password
   */
  updatePassword(id: string, hashedPassword: string): Promise<void>;

  /**
   * Update user role
   */
  updateRole(id: string, role: string): Promise<User>;

  /**
   * Delete user
   */
  delete(id: string): Promise<void>;

  /**
   * Count users
   */
  count(where?: { role?: string }): Promise<number>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
