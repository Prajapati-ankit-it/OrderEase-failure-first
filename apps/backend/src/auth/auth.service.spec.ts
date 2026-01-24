import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '@orderease/shared-database';
import {
  createMockPrismaService,
  createMockJwtService,
  createMockConfigService,
} from '../test-utils';
import { Role, MESSAGES } from '@orderease/shared-contracts';

// Mock the utils module
jest.mock('../utils', () => ({
  hashPassword: jest.fn((password: string) =>
    Promise.resolve(`hashed_${password}`),
  ),
  comparePassword: jest.fn(),
  parseJwtExpiration: jest.fn(
    (value: string, defaultValue: string) => value || defaultValue,
  ),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let jwtService: ReturnType<typeof createMockJwtService>;
  let configService: ReturnType<typeof createMockConfigService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password123',
    name: 'Test User',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = createMockPrismaService();
    jwtService = createMockJwtService();
    configService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const signUpDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      role: Role.USER,
    };

    it('should successfully register a new user', async () => {
      const createdUser = {
        id: 'new-user-id',
        email: signUpDto.email,
        name: signUpDto.name,
        role: signUpDto.role,
        createdAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(createdUser);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.signUp(signUpDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signUpDto.email,
          password: `hashed_${signUpDto.password}`,
          name: signUpDto.name,
          role: signUpDto.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user.email).toBe(signUpDto.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        MESSAGES.AUTH.USER_EXISTS,
      );

      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should default to USER role if not provided', async () => {
      const signUpDtoWithoutRole = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const createdUser = {
        id: 'new-user-id',
        email: signUpDtoWithoutRole.email,
        name: signUpDtoWithoutRole.name,
        role: Role.USER,
        createdAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(createdUser);

      await service.signUp(signUpDtoWithoutRole as any);

      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: Role.USER,
          }),
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const { comparePassword } = require('../utils');

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const { comparePassword } = require('../utils');

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        MESSAGES.AUTH.INVALID_CREDENTIALS,
      );
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';
    const payload = {
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    };

    it('should successfully refresh tokens with valid refresh token', async () => {
      jwtService.verify.mockReturnValue(payload);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-refresh-secret',
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        MESSAGES.AUTH.TOKEN_INVALID,
      );
    });

    it('should throw UnauthorizedException with TOKEN_INVALID if user not found', async () => {
      jwtService.verify.mockReturnValue(payload);
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        MESSAGES.AUTH.TOKEN_INVALID,
      );
    });
  });

  describe('generateTokens (private method)', () => {
    it('should generate access and refresh tokens with correct payload', async () => {
      const signUpDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const createdUser = {
        id: 'user-id',
        email: signUpDto.email,
        name: signUpDto.name,
        role: Role.USER,
        createdAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(createdUser);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await service.signUp(signUpDto as any);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
        }),
        expect.objectContaining({
          secret: 'test-jwt-secret',
        }),
      );

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
        }),
        expect.objectContaining({
          secret: 'test-refresh-secret',
        }),
      );
    });
  });
});
