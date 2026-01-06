import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService, LogLevel } from './logger.service';

describe('AppLoggerService', () => {
  let service: AppLoggerService;
  let configService: ConfigService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

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

    service = module.get<AppLoggerService>(AppLoggerService);
    configService = module.get<ConfigService>(ConfigService);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log info message with JSON format', () => {
    service.log('Test message', 'TestContext');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    
    expect(logOutput.level).toBe(LogLevel.INFO);
    expect(logOutput.message).toBe('Test message');
    expect(logOutput.context).toBe('TestContext');
    expect(logOutput.timestamp).toBeDefined();
  });

  it('should include requestId when set', () => {
    service.setRequestId('test-request-id');
    service.log('Test message');

    const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logOutput.requestId).toBe('test-request-id');
  });

  it('should include userId when set', () => {
    service.setUserId('test-user-id');
    service.log('Test message');

    const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logOutput.userId).toBe('test-user-id');
  });

  it('should log error with stack trace in development', () => {
    service.error('Error message', 'Stack trace here', 'ErrorContext');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logOutput = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    
    expect(logOutput.level).toBe(LogLevel.ERROR);
    expect(logOutput.message).toBe('Error message');
    expect(logOutput.error.stack).toBe('Stack trace here');
  });

  it('should not include stack trace in production', () => {
    // Create new service with production config
    const prodConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'app.nodeEnv') return 'production';
        return undefined;
      }),
    };

    const prodService = new AppLoggerService(prodConfigService as any);
    prodService.error('Error message', 'Stack trace here', 'ErrorContext');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logOutput = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    
    expect(logOutput.level).toBe(LogLevel.ERROR);
    expect(logOutput.error.stack).toBeUndefined();
  });

  it('should log warning message', () => {
    service.warn('Warning message', 'WarnContext');

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const logOutput = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    
    expect(logOutput.level).toBe(LogLevel.WARN);
    expect(logOutput.message).toBe('Warning message');
  });

  it('should include metadata when provided', () => {
    service.log('Test message', 'TestContext', { extra: 'data', count: 42 });

    const logOutput = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logOutput.metadata).toEqual({ extra: 'data', count: 42 });
  });

  it('should handle multiple contexts', () => {
    service.setContext('DefaultContext');
    service.log('Message 1');
    service.log('Message 2', 'OverrideContext');

    const logOutput1 = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    const logOutput2 = JSON.parse(consoleLogSpy.mock.calls[1][0]);

    expect(logOutput1.context).toBe('DefaultContext');
    expect(logOutput2.context).toBe('OverrideContext');
  });
});
