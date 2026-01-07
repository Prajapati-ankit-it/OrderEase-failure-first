# Structured Logging and Error Handling

This document explains the structured logging and error handling system implemented in the OrderEase backend.

## Overview

The system provides:
- **Structured JSON logs** for better parsing and analysis
- **Correlation IDs** (request IDs) for distributed tracing
- **User context** in logs when available
- **Consistent error handling** through a global exception filter
- **Environment-aware logging** (stack traces only in development)

## Components

### 1. Request Context Middleware

**Location:** `src/common/middleware/request-context.middleware.ts`

Automatically generates or uses correlation IDs from the `x-request-id` header.

```typescript
// Request automatically has requestId attached
// Response automatically includes x-request-id header
```

### 2. Structured Logger Service

**Location:** `src/common/logger/logger.service.ts`

Provides JSON-formatted logging with context support.

**Usage:**

```typescript
import { AppLoggerService } from 'src/common';

@Injectable()
export class MyService {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('MyService');
  }

  doSomething(userId: string) {
    // Set user context
    this.logger.setUserId(userId);
    
    // Log info
    this.logger.log('User action started', 'MyService', {
      action: 'doSomething',
      timestamp: Date.now()
    });
    
    try {
      // ... business logic
    } catch (error) {
      // Log error with stack trace (included only in dev)
      this.logger.error(
        'Operation failed',
        error instanceof Error ? error.stack : undefined,
        'MyService',
        { userId }
      );
    }
  }
}
```

**Log Output Example:**

```json
{
  "timestamp": "2026-01-06T18:00:00.000Z",
  "level": "info",
  "context": "MyService",
  "message": "User action started",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "metadata": {
    "action": "doSomething",
    "timestamp": 1736186400000
  }
}
```

### 3. Global Exception Filter

**Location:** `src/common/filters/global-exception.filter.ts`

Catches all exceptions and logs them with structured format.

**Features:**
- Automatically includes correlation ID in error responses
- Includes user ID in logs when available
- Handles HTTP exceptions, Prisma errors, and generic errors
- Returns stack traces only in non-production environments

**Error Response Example:**

```json
{
  "success": false,
  "statusCode": 404,
  "timestamp": "2026-01-06T18:00:00.000Z",
  "path": "/api/users/123",
  "message": "User not found",
  "errorCode": "NOT_FOUND",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "stack": "Error: User not found\n    at ..." // Only in development
}
```

### 4. Logging Interceptor

**Location:** `src/common/interceptors/logging.interceptor.ts`

Logs all incoming requests and outgoing responses.

**Features:**
- Logs request method, URL, IP, and user agent
- **Deep sanitization** of sensitive data in request bodies
- Tracks response times
- Includes correlation ID and user ID when available

**Sensitive Data Sanitization:**
The interceptor automatically sanitizes the following field names (case-insensitive) at all nesting levels:
- `password`
- `refreshToken`
- `token`
- `accessToken`
- `apiKey`
- `secret`
- `secretKey`
- `privateKey`
- `credential`
- `credentials`

**Important:** Sensitive fields are sanitized regardless of their value type (string, number, boolean, object, array, etc.).

**Example:**
```typescript
// Request body:
{
  user: {
    email: "test@test.com",
    password: "secret123"  // string
  },
  config: {
    apiKey: 12345,  // number
    token: true  // boolean
  }
}

// Logged as:
{
  user: {
    email: "test@test.com",
    password: "***"
  },
  config: {
    apiKey: "***",
    token: "***"
  }
}
```

**Note:** Fields containing sensitive keywords (e.g., `userPassword`, `mySecret`) are also sanitized.

## Configuration

The logging system respects the `NODE_ENV` environment variable:

- **Production** (`NODE_ENV=production`):
  - Error stacks excluded from logs and responses
  - Unhandled rejections cause process exit
  
- **Development** (default):
  - Error stacks included for debugging
  - Unhandled rejections logged but don't exit process

## Best Practices

1. **Always set context** when using the logger:
   ```typescript
   this.logger.setContext('MyComponent');
   ```

2. **Include relevant metadata**:
   ```typescript
   this.logger.log('Action performed', 'MyService', {
     userId: user.id,
     action: 'updateProfile',
     affectedFields: ['email', 'name']
   });
   ```

3. **Use correlation IDs** for distributed tracing:
   - The system automatically propagates `x-request-id` headers
   - Include this ID in external API calls for end-to-end tracing

4. **Sanitize sensitive data**:
   - Never log passwords, tokens, or PII directly
   - Use the logger's built-in sanitization for request bodies

5. **Use appropriate log levels**:
   - `error()` - Errors that need immediate attention
   - `warn()` - Potential issues or deprecated usage
   - `log()` - Normal operations and important events
   - `debug()` - Detailed diagnostic information

## Correlation ID Propagation

To trace requests across services:

1. **Client sends request** with optional `x-request-id` header
2. **Backend receives** and uses existing ID or generates new one
3. **Backend responds** with `x-request-id` in response headers
4. **All logs** for that request include the requestId
5. **External API calls** should include the correlation ID

Example external API call:
```typescript
const headers = {
  'x-request-id': request.requestId,
  // ... other headers
};

await axios.get('https://external-api.com/data', { headers });
```

## Monitoring & Alerting

With structured JSON logs, you can:

1. **Parse logs** easily with log aggregators (ELK, CloudWatch, Datadog)
2. **Search by correlation ID** to trace requests
3. **Filter by user ID** to debug user-specific issues
4. **Alert on error patterns** using log analysis tools
5. **Track response times** for performance monitoring

## Migration from Legacy Code

The old gateway implementations (`src/gateway/*`) are deprecated. New code should use:

- ✅ `src/common/logger/logger.service.ts` instead of raw `console.log`
- ✅ `src/common/filters/global-exception.filter.ts` for error handling
- ✅ `src/common/interceptors/logging.interceptor.ts` for request logging
- ✅ `src/common/middleware/request-context.middleware.ts` for correlation IDs

The legacy implementations are kept for backward compatibility but are not used in the main application.
