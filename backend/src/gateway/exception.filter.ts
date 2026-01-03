import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Interface for HTTP request with typed properties
 */
interface HttpRequest {
  method: string;
  url: string;
}

/**
 * Global exception filter for handling all errors
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<HttpRequest>();

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

    // Log the error
    const errorStack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      errorStack,
    );

    // Send error response
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errorCode,
    });
  }
}
