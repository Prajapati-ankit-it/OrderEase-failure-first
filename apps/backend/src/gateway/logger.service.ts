import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Log level enum
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log entry interface for structured logging
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  requestId?: string;
  userId?: string;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Structured logger service that outputs JSON logs
 */
@Injectable()
export class AppLoggerService implements NestLoggerService {
  private context?: string;
  private requestId?: string;
  private userId?: string;
  private isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction =
      this.configService.get<string>('app.nodeEnv') === 'production';
  }

  /**
   * Set context for all subsequent log calls
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Set request ID for all subsequent log calls
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * Set user ID for all subsequent log calls
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Log info message
   */
  log(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.writeLog(LogLevel.INFO, message, context, metadata);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const errorObj = trace ? { message, stack: trace } : { message };
    this.writeLog(LogLevel.ERROR, message, context, metadata, errorObj);
  }

  /**
   * Log warning message
   */
  warn(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.writeLog(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log debug message
   */
  debug(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.writeLog(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Log verbose message (alias for debug)
   */
  verbose(
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.debug(message, context, metadata);
  }

  /**
   * Write structured log entry
   */
  private writeLog(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
    error?: { message: string; stack?: string; name?: string },
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Add context if available
    if (context || this.context) {
      logEntry.context = context || this.context;
    }

    // Add request ID if available
    if (this.requestId) {
      logEntry.requestId = this.requestId;
    }

    // Add user ID if available
    if (this.userId) {
      logEntry.userId = this.userId;
    }

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      logEntry.metadata = metadata;
    }

    // Add error details
    if (error) {
      logEntry.error = {
        message: error.message,
        name: error.name,
      };

      // Include stack trace only in non-production
      if (!this.isProduction && error.stack) {
        logEntry.error.stack = error.stack;
      }
    }

    // Output as JSON
    const logOutput = JSON.stringify(logEntry);

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(logOutput);
        break;
      case LogLevel.WARN:
        console.warn(logOutput);
        break;
      case LogLevel.DEBUG:
        console.debug(logOutput);
        break;
      default:
        console.log(logOutput);
    }
  }
}