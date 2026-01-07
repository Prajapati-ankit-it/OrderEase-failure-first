import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database';
import { TestPrismaService } from './test-prisma.service';

/**
 * Helper to create a testing module with common dependencies
 */
export async function createTestingModule(config: {
  providers?: any[];
  imports?: any[];
  controllers?: any[];
}) {
  const moduleBuilder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          () => ({
            jwt: {
              secret: 'test-jwt-secret',
              expiresIn: '1h',
              refreshSecret: 'test-refresh-secret',
              refreshExpiresIn: '7d',
            },
          }),
        ],
      }),
      JwtModule.register({
        secret: 'test-jwt-secret',
        signOptions: { expiresIn: '1h' },
      }),
      ...(config.imports || []),
    ],
    controllers: config.controllers || [],
    providers: [
      {
        provide: PrismaService,
        useClass: TestPrismaService,
      },
      ...(config.providers || []),
    ],
  });

  return moduleBuilder.compile();
}

/**
 * Create a mock PrismaService for unit tests
 */
export function createMockPrismaService() {
  const mockService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    food: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Configure transaction to pass the same mock instance
  mockService.$transaction.mockImplementation((callback) => {
    if (typeof callback === 'function') {
      return callback(mockService);
    }
    return Promise.resolve([]);
  });

  return mockService;
}

/**
 * Create a mock ConfigService
 */
export function createMockConfigService() {
  return {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'jwt.secret': 'test-jwt-secret',
        'jwt.expiresIn': '1h',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };
}

/**
 * Create a mock JwtService
 */
export function createMockJwtService() {
  return {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({
      sub: 'user-id',
      email: 'test@example.com',
      role: 'USER',
    }),
  };
}
