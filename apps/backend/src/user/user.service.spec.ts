import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '@orderease/shared-database';
import { createMockPrismaService } from '../test-utils';
import { MESSAGES, Role } from '@orderease/shared-contracts';

// Mock the utils module
jest.mock('../utils', () => ({
  hashPassword: jest.fn((password: string) =>
    Promise.resolve(`hashed_${password}`),
  ),
  comparePassword: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prismaService: ReturnType<typeof createMockPrismaService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password123',
    name: 'Test User',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserProfile = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    role: mockUser.role,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserProfile);

      const result = await service.getProfile('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUserProfile);
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile('non-existent')).rejects.toThrow(
        MESSAGES.USER.NOT_FOUND,
      );
    });
  });

  describe('updateProfile', () => {
    const updateProfileDto = {
      name: 'Updated Name',
    };

    it('should successfully update user profile', async () => {
      const updatedUser = {
        ...mockUserProfile,
        name: 'Updated Name',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', updateProfileDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateProfileDto,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent', updateProfileDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateProfile('non-existent', updateProfileDto),
      ).rejects.toThrow(MESSAGES.USER.NOT_FOUND);
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
    };

    it('should successfully update password', async () => {
      const { comparePassword } = require('../utils');

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: 'hashed_newPassword456',
      });

      const result = await service.updatePassword(
        'user-123',
        updatePasswordDto,
      );

      expect(comparePassword).toHaveBeenCalledWith(
        updatePasswordDto.currentPassword,
        mockUser.password,
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'hashed_newPassword456' },
      });
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePassword('non-existent', updatePasswordDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updatePassword('non-existent', updatePasswordDto),
      ).rejects.toThrow(MESSAGES.USER.NOT_FOUND);
    });

    it('should throw UnauthorizedException if current password is invalid', async () => {
      const { comparePassword } = require('../utils');

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      await expect(
        service.updatePassword('user-123', updatePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.updatePassword('user-123', updatePasswordDto),
      ).rejects.toThrow(MESSAGES.AUTH.INVALID_CREDENTIALS);

      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserOrders', () => {
    const mockOrder = {
      id: 'order-1',
      userId: 'user-123',
      totalPrice: 29.99,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      orderItems: [
        {
          id: 'item-1',
          orderId: 'order-1',
          foodId: 'food-1',
          quantity: 2,
          price: 14.99,
          food: {
            id: 'food-1',
            name: 'Pizza',
            description: 'Delicious pizza',
            price: 14.99,
            category: 'Italian',
            image: 'pizza.jpg',
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    };

    it('should return user orders with pagination', async () => {
      prismaService.order.findMany.mockResolvedValue([mockOrder]);
      prismaService.order.count.mockResolvedValue(1);

      const result = await service.getUserOrders('user-123', 1, 10);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              food: true,
            },
          },
        },
      });
      expect(result).toEqual({
        orders: [mockOrder],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should handle pagination correctly', async () => {
      prismaService.order.findMany.mockResolvedValue([]);
      prismaService.order.count.mockResolvedValue(25);

      const result = await service.getUserOrders('user-123', 2, 10);

      expect(prismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should return empty orders array if user has no orders', async () => {
      prismaService.order.findMany.mockResolvedValue([]);
      prismaService.order.count.mockResolvedValue(0);

      const result = await service.getUserOrders('user-123', 1, 10);

      expect(result.orders).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
