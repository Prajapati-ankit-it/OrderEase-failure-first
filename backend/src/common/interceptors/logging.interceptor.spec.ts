import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { AppLoggerService } from '../logger/logger.service';
import { RequestWithContext } from '../middleware/request-context.middleware';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let configService: ConfigService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    const loggerService = module.get<AppLoggerService>(AppLoggerService);
    configService = module.get<ConfigService>(ConfigService);
    interceptor = new LoggingInterceptor(loggerService, configService);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    // Also spy on console.debug since that's used for request body logging
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockExecutionContext = (
    request: Partial<RequestWithContext>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (): CallHandler => {
    return {
      handle: () => of({}),
    };
  };

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log incoming request', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      expect(consoleLogSpy).toHaveBeenCalled();
      const logs = consoleLogSpy.mock.calls.map((call) => JSON.parse(call[0]));
      const incomingLog = logs.find((log) => log.message.includes('Incoming'));
      expect(incomingLog).toBeDefined();
      expect(incomingLog.requestId).toBe('test-request-id');
      expect(incomingLog.metadata.method).toBe('GET');
      expect(incomingLog.metadata.url).toBe('/api/test');
      done();
    });
  });

  it('should log completed request with response time', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/test',
      ip: '127.0.0.1',
      headers: {},
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      expect(consoleLogSpy).toHaveBeenCalled();
      const logs = consoleLogSpy.mock.calls.map((call) => JSON.parse(call[0]));
      const completedLog = logs.find((log) =>
        log.message.includes('Completed'),
      );
      expect(completedLog).toBeDefined();
      expect(completedLog.metadata.responseTime).toBeDefined();
      expect(typeof completedLog.metadata.responseTime).toBe('number');
      done();
    });
  });

  it('should include userId in logs when available', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      headers: {},
      requestId: 'test-request-id',
      user: {
        id: 'user-123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'USER',
      },
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      expect(consoleLogSpy).toHaveBeenCalled();
      const logs = consoleLogSpy.mock.calls.map((call) => JSON.parse(call[0]));
      const incomingLog = logs.find((log) => log.message.includes('Incoming'));
      expect(incomingLog.userId).toBe('user-123');
      done();
    });
  });

  it('should sanitize password in request body', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/auth/login',
      ip: '127.0.0.1',
      headers: {},
      body: {
        email: 'test@test.com',
        password: 'secret123',
      },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      expect(consoleDebugSpy).toHaveBeenCalled();
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find(
        (log) => log.message === 'Request Body' && log.metadata?.body,
      );
      expect(bodyLog).toBeDefined();
      expect(bodyLog.metadata.body.password).toBe('***');
      expect(bodyLog.metadata.body.email).toBe('test@test.com');
      done();
    });
  });

  it('should sanitize refreshToken in request body', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/auth/refresh',
      ip: '127.0.0.1',
      headers: {},
      body: {
        refreshToken: 'secret-refresh-token',
      },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find(
        (log) => log.message === 'Request Body' && log.metadata?.body,
      );
      expect(bodyLog).toBeDefined();
      expect(bodyLog.metadata.body.refreshToken).toBe('***');
      done();
    });
  });

  it('should sanitize token in request body', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/verify',
      ip: '127.0.0.1',
      headers: {},
      body: {
        token: 'secret-token',
        userId: 'user-123',
      },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find(
        (log) => log.message === 'Request Body' && log.metadata?.body,
      );
      expect(bodyLog).toBeDefined();
      expect(bodyLog.metadata.body.token).toBe('***');
      expect(bodyLog.metadata.body.userId).toBe('user-123');
      done();
    });
  });

  it('should not log request body for GET requests', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      headers: {},
      body: { someData: 'value' },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find((log) => log.message === 'Request Body');
      expect(bodyLog).toBeUndefined();
      done();
    });
  });

  it('should not log empty request bodies', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/test',
      ip: '127.0.0.1',
      headers: {},
      body: {},
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find((log) => log.message === 'Request Body');
      expect(bodyLog).toBeUndefined();
      done();
    });
  });

  it('should create isolated logger instance per request', (done) => {
    const mockRequest1: Partial<RequestWithContext> = {
      method: 'GET',
      url: '/api/test1',
      ip: '127.0.0.1',
      headers: {},
      requestId: 'request-1',
      user: {
        id: 'user-1',
        email: 'user1@test.com',
        name: 'User 1',
        role: 'USER',
      },
    };

    const mockRequest2: Partial<RequestWithContext> = {
      method: 'GET',
      url: '/api/test2',
      ip: '127.0.0.1',
      headers: {},
      requestId: 'request-2',
      user: {
        id: 'user-2',
        email: 'user2@test.com',
        name: 'User 2',
        role: 'USER',
      },
    };

    const context1 = createMockExecutionContext(mockRequest1);
    const context2 = createMockExecutionContext(mockRequest2);
    const next1 = createMockCallHandler();
    const next2 = createMockCallHandler();

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed === 2) {
        const logs = consoleLogSpy.mock.calls.map((call) =>
          JSON.parse(call[0]),
        );
        const request1Logs = logs.filter(
          (log) => log.requestId === 'request-1',
        );
        const request2Logs = logs.filter(
          (log) => log.requestId === 'request-2',
        );

        expect(request1Logs.every((log) => log.userId === 'user-1')).toBe(true);
        expect(request2Logs.every((log) => log.userId === 'user-2')).toBe(true);
        done();
      }
    };

    interceptor.intercept(context1, next1).subscribe(checkDone);
    interceptor.intercept(context2, next2).subscribe(checkDone);
  });

  it('should sanitize nested password fields', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/user/update',
      ip: '127.0.0.1',
      headers: {},
      body: {
        user: {
          email: 'test@test.com',
          password: 'secret-password',
          profile: {
            name: 'Test User',
          },
        },
      },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find(
        (log) => log.message === 'Request Body' && log.metadata?.body,
      );
      expect(bodyLog).toBeDefined();
      expect(bodyLog.metadata.body.user.password).toBe('***');
      expect(bodyLog.metadata.body.user.email).toBe('test@test.com');
      expect(bodyLog.metadata.body.user.profile.name).toBe('Test User');
      done();
    });
  });

  it('should sanitize apiKey and secretKey fields', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/config',
      ip: '127.0.0.1',
      headers: {},
      body: {
        config: {
          apiKey: 'secret-api-key',
          secretKey: 'secret-key',
          setting: 'some-value',
        },
      },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find(
        (log) => log.message === 'Request Body' && log.metadata?.body,
      );
      expect(bodyLog).toBeDefined();
      expect(bodyLog.metadata.body.config.apiKey).toBe('***');
      expect(bodyLog.metadata.body.config.secretKey).toBe('***');
      expect(bodyLog.metadata.body.config.setting).toBe('some-value'); // Not sensitive
      done();
    });
  });

  it('should sanitize credentials in nested arrays', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/batch-users',
      ip: '127.0.0.1',
      headers: {},
      body: {
        users: [
          { email: 'user1@test.com', password: 'pass1' },
          { email: 'user2@test.com', password: 'pass2' },
        ],
      },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find(
        (log) => log.message === 'Request Body' && log.metadata?.body,
      );
      expect(bodyLog).toBeDefined();
      expect(bodyLog.metadata.body.users[0].password).toBe('***');
      expect(bodyLog.metadata.body.users[1].password).toBe('***');
      expect(bodyLog.metadata.body.users[0].email).toBe('user1@test.com');
      expect(bodyLog.metadata.body.users[1].email).toBe('user2@test.com');
      done();
    });
  });

  it('should sanitize sensitive fields with non-string values', (done) => {
    const mockRequest: Partial<RequestWithContext> = {
      method: 'POST',
      url: '/api/config',
      ip: '127.0.0.1',
      headers: {},
      body: {
        password: 12345, // number
        token: true, // boolean
        apiKey: { nested: 'value' }, // object
        normalField: 'visible',
      },
      requestId: 'test-request-id',
    };

    const context = createMockExecutionContext(mockRequest);
    const next = createMockCallHandler();

    interceptor.intercept(context, next).subscribe(() => {
      const logs = consoleDebugSpy.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      const bodyLog = logs.find(
        (log) => log.message === 'Request Body' && log.metadata?.body,
      );
      expect(bodyLog).toBeDefined();
      expect(bodyLog.metadata.body.password).toBe('***');
      expect(bodyLog.metadata.body.token).toBe('***');
      expect(bodyLog.metadata.body.apiKey).toBe('***');
      expect(bodyLog.metadata.body.normalField).toBe('visible');
      done();
    });
  });
});
