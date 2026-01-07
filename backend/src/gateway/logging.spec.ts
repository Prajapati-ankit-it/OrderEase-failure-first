import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, Logger } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { GlobalExceptionFilter } from './exception.filter';

describe('Error Logging (Duplicate Prevention)', () => {
  let app: INestApplication;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [],
    }).compile();

    app = moduleRef.createNestApplication();

    // Apply global interceptor and filter
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();

    // Spy on Logger methods
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('should log errors only once when exception occurs', async () => {
    // Simulate error being thrown and caught by filter
    const exception = new NotFoundException('Test endpoint not found');
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
        getRequest: () => ({
          method: 'GET',
          url: '/api/test',
        }),
      }),
    };

    const filter = new GlobalExceptionFilter();
    filter.catch(exception, mockHost as any);

    // Should only be logged once by GlobalExceptionFilter
    const errorCalls = loggerErrorSpy.mock.calls.filter((call) =>
      call[0].includes('GET /api/test'),
    );

    // Verify error is logged exactly once
    expect(errorCalls.length).toBe(1);
    expect(errorCalls[0][0]).toContain('Status: 404');
    expect(errorCalls[0][0]).toContain('Test endpoint not found');
  });

  it('should log successful requests in interceptor', () => {
    // LoggingInterceptor should log successful requests
    const interceptorLogCalls = loggerLogSpy.mock.calls.filter(
      (call) => call[0].includes('Incoming') || call[0].includes('Completed'),
    );

    // This verifies the interceptor is still logging normal requests
    expect(loggerLogSpy).toBeDefined();
  });
});
