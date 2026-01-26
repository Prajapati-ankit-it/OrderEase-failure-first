/**
 * @deprecated Gateway module implementations are legacy.
 * Use the new structured logging implementations from src/common instead:
 * - src/common/filters/global-exception.filter.ts
 * - src/common/interceptors/logging.interceptor.ts
 * - src/common/middleware/request-context.middleware.ts
 */

export * from './logging.interceptor';
export * from './exception.filter';
export * from './rate-limit.middleware';
export * from './request-context.middleware';
export * from './logger.service';
