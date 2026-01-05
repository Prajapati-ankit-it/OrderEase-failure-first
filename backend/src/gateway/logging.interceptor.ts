import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interface for HTTP request with typed properties
 */
interface HttpRequest {
  method: string;
  url: string;
  ip: string;
  body: Record<string, unknown>;
  get: (header: string) => string | undefined;
}

/**
 * Interceptor for logging all API requests and responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HttpRequest>();
    const { method, url, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    // Log incoming request
    this.logger.log(
      `Incoming ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Log request body for non-GET requests (excluding sensitive data)
    if (method !== 'GET' && body) {
      const sanitizedBody = { ...body };
      if ('password' in sanitizedBody) sanitizedBody.password = '***';
      if ('refreshToken' in sanitizedBody) sanitizedBody.refreshToken = '***';
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`Completed ${method} ${url} - ${responseTime}ms`);
        },
        // Error logging removed to prevent duplicate logs
        // Errors are logged by GlobalExceptionFilter
      }),
    );
  }
}
