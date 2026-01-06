import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AppLoggerService } from '../logger/logger.service';
import { RequestWithContext } from '../middleware/request-context.middleware';

/**
 * Global exception filter for handling all errors with structured logging
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly isProduction: boolean;

  constructor(
    private readonly logger: AppLoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('GlobalExceptionFilter');
    this.isProduction =
      this.configService.get<string>('app.nodeEnv') === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithContext>();

    // Set request context in logger
    if (request.requestId) {
      this.logger.setRequestId(request.requestId);
    }
    if (request.user?.id) {
      this.logger.setUserId(request.user.id);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const msg = exceptionResponse.message;
        message = Array.isArray(msg) ? msg.join(', ') : String(msg);
        errorCode =
          'error' in exceptionResponse
            ? String(exceptionResponse.error)
            : 'VALIDATION_ERROR';
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception
    ) {
      const code = String((exception as { code: unknown }).code);
      if (code === 'P2002') {
        // Prisma unique constraint violation
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';
        errorCode = 'CONFLICT_ERROR';
      } else if (code.startsWith('P')) {
        // Other Prisma errors
        status = HttpStatus.BAD_REQUEST;
        message = 'Database operation failed';
        errorCode = 'DATABASE_ERROR';
      }
    }

    // Log the error with structured logging
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${message}`,
      errorStack,
      'GlobalExceptionFilter',
      {
        method: request.method,
        url: request.url,
        statusCode: status,
        errorCode,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    );

    // Send error response
    const errorResponse: Record<string, unknown> = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errorCode,
    };

    // Include request ID in response if available
    if (request.requestId) {
      errorResponse.requestId = request.requestId;
    }

    // Include stack trace in non-production environments
    if (!this.isProduction && errorStack) {
      errorResponse.stack = errorStack;
    }

    response.status(status).json(errorResponse);
  }
}
