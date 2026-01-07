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
 * List of sensitive field names to sanitize in request bodies
 */
const SENSITIVE_FIELDS = [
  'password',
  'refreshToken',
  'token',
  'accessToken',
  'apiKey',
  'secret',
  'secretKey',
  'privateKey',
  'credential',
  'credentials',
];

/**
 * Recursively sanitize sensitive fields in an object
 * @param obj The object to sanitize
 * @returns A new object with sensitive fields replaced with '***'
 */
function deepSanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches any sensitive field (case-insensitive)
      const isSensitive = SENSITIVE_FIELDS.some(
        (field) =>
          key.toLowerCase() === field.toLowerCase() ||
          key.toLowerCase().includes(field.toLowerCase()),
      );

      if (isSensitive) {
        // Sanitize sensitive fields regardless of their type
        sanitized[key] = '***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = deepSanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return obj;
}

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
      // Deep sanitize the body to handle nested sensitive fields
      const sanitizedBody = deepSanitize(body);

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
