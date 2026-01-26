/**
 * Prisma User Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { User, UserRole, SafeUser } from '@orderease/shared-contracts';
import { IUserRepository, UserUpdateData } from './user.repository.interface';
import { Role as PrismaRole } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role as PrismaRole,
      },
    });

    return this.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return this.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) {
      return null;
    }

    return this.toDomain(prismaUser);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ users: SafeUser[]; total: number }> {
    const skip = (page - 1) * limit;

    const [prismaUsers, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const users = prismaUsers.map((pu) => this.toSafeUser(pu));

    return { users, total };
  }

  async update(id: string, data: UserUpdateData): Promise<User> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    const prismaUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(prismaUser);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updateRole(id: string, role: string): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id },
      data: { role: role as PrismaRole },
    });

    return this.toDomain(prismaUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async count(where?: { role?: string }): Promise<number> {
    const prismaWhere: { role?: PrismaRole } = {};
    if (where?.role) {
      prismaWhere.role = where.role as PrismaRole;
    }
    return this.prisma.user.count({ where: prismaWhere });
  }

  private toDomain(prismaUser: {
    id: string;
    email: string;
    password: string;
    name: string | null;
    role: PrismaRole;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      name: prismaUser.name ?? undefined,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private toSafeUser(prismaUser: {
    id: string;
    email: string;
    name: string | null;
    role: PrismaRole;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name ?? undefined,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
}
