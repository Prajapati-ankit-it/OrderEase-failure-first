import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './global-exception.filter';
import { AppLoggerService } from '../logger/logger.service';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let app: INestApplication;
  let filter: GlobalExceptionFilter;
  let logger: AppLoggerService;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AppLoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app.nodeEnv') return 'development';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    logger = moduleRef.get<AppLoggerService>(AppLoggerService);
    const configService = moduleRef.get<ConfigService>(ConfigService);
    filter = new GlobalExceptionFilter(logger, configService);

    loggerErrorSpy = jest.spyOn(logger, 'error');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HTTP exceptions', () => {
    const exception = new NotFoundException('Resource not found');
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      requestId: 'test-request-id',
      headers: {},
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
        requestId: 'test-request-id',
      }),
    );
    expect(loggerErrorSpy).toHaveBeenCalled();
  });

  it('should include requestId in response', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      method: 'POST',
      url: '/api/test',
      requestId: 'correlation-id-123',
      headers: {},
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter.catch(exception, mockHost as any);

    const responseCall = mockResponse.json.mock.calls[0][0];
    expect(responseCall.requestId).toBe('correlation-id-123');
  });

  it('should include userId in logs when available', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      method: 'POST',
      url: '/api/test',
      requestId: 'test-request-id',
      user: {
        id: 'user-123',
        email: 'test@test.com',
        name: 'Test',
        role: 'USER',
      },
      headers: {},
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter.catch(exception, mockHost as any);

    expect(loggerErrorSpy).toHaveBeenCalled();
    // The logger should have userId set
    expect(logger['userId']).toBe('user-123');
  });

  it('should handle Prisma P2002 errors', () => {
    const exception = { code: 'P2002', meta: {} };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      method: 'POST',
      url: '/api/test',
      requestId: 'test-request-id',
      headers: {},
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter.catch(exception, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Resource already exists',
        errorCode: 'CONFLICT_ERROR',
      }),
    );
  });

  it('should include stack trace in development', () => {
    const exception = new Error('Test error');
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      requestId: 'test-request-id',
      headers: {},
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter.catch(exception, mockHost as any);

    const responseCall = mockResponse.json.mock.calls[0][0];
    expect(responseCall.stack).toBeDefined();
  });

  it('should not include stack trace in production', () => {
    // Create filter with production config
    const prodConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'app.nodeEnv') return 'production';
        return undefined;
      }),
    };
    const prodFilter = new GlobalExceptionFilter(
      logger,
      prodConfigService as any,
    );

    const exception = new Error('Test error');
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      requestId: 'test-request-id',
      headers: {},
    };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    prodFilter.catch(exception, mockHost as any);

    const responseCall = mockResponse.json.mock.calls[0][0];
    expect(responseCall.stack).toBeUndefined();
  });
});
