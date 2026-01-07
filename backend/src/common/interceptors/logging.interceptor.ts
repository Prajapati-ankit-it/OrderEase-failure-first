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
import { ConfigService } from '@nestjs/config';

/**
 * Interceptor for logging all API requests and responses with structured logging
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly loggerService: AppLoggerService,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const method = request.method;
    const url = request.url;
    const ip = request.ip;
    const body = request.body as Record<string, unknown> | undefined;
    const userAgent = request.headers['user-agent'] || '';
    const now = Date.now();

    // Create a new logger instance for this request to avoid state contamination
    const logger = new AppLoggerService(this.configService);
    logger.setContext('LoggingInterceptor');

    // Set request context in logger
    if (request.requestId) {
      logger.setRequestId(request.requestId);
    }
    if (request.user?.id) {
      logger.setUserId(request.user.id);
    }

    // Log incoming request
    logger.log(`Incoming ${method} ${url}`, 'LoggingInterceptor', {
      method,
      url,
      ip,
      userAgent,
    });

    // Log request body for non-GET requests (excluding sensitive data)
    if (
      method !== 'GET' &&
      body &&
      typeof body === 'object' &&
      Object.keys(body).length > 0
    ) {
      const sanitizedBody: Record<string, unknown> = { ...body };
      if ('password' in sanitizedBody) sanitizedBody.password = '***';
      if ('refreshToken' in sanitizedBody) sanitizedBody.refreshToken = '***';
      if ('token' in sanitizedBody) sanitizedBody.token = '***';

      logger.debug(`Request Body`, 'LoggingInterceptor', {
        body: sanitizedBody,
      });
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          logger.log(`Completed ${method} ${url}`, 'LoggingInterceptor', {
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
