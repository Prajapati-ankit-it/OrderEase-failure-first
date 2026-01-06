import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../logger/logger.service';
import { RequestWithContext } from '../middleware/request-context.middleware';

/**
 * Interceptor for logging all API requests and responses with structured logging
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('LoggingInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const { method, url, ip, body } = request;
    const userAgent = request.headers['user-agent'] || '';
    const now = Date.now();

    // Set request context in logger
    if (request.requestId) {
      this.logger.setRequestId(request.requestId);
    }
    if (request.user?.id) {
      this.logger.setUserId(request.user.id);
    }

    // Log incoming request
    this.logger.log(`Incoming ${method} ${url}`, 'LoggingInterceptor', {
      method,
      url,
      ip,
      userAgent,
    });

    // Log request body for non-GET requests (excluding sensitive data)
    if (method !== 'GET' && body && Object.keys(body).length > 0) {
      const sanitizedBody = { ...body };
      if ('password' in sanitizedBody) sanitizedBody.password = '***';
      if ('refreshToken' in sanitizedBody) sanitizedBody.refreshToken = '***';
      if ('token' in sanitizedBody) sanitizedBody.token = '***';
      
      this.logger.debug(`Request Body`, 'LoggingInterceptor', {
        body: sanitizedBody,
      });
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`Completed ${method} ${url}`, 'LoggingInterceptor', {
            method,
            url,
            responseTime,
          });
        },
        // Error logging removed to prevent duplicate logs
        // Errors are logged by GlobalExceptionFilter
      }),
    );
  }
}
