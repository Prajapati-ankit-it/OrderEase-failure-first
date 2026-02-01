# OrderEase API Gateway

Minimal NestJS-based API Gateway for HTTP routing and request forwarding.

## Responsibilities

- HTTP routing to backend services
- Request forwarding with JWT verification
- Shared DTO validation
- Extracting user ID from JWT and setting `x-user-id` header for backend services

## Routes

### Backend Service (Port 3001)
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User management
- `/api/admin/*` - Admin operations
- `/api/food/*` - Food catalog
- `/api/public/*` - Public endpoints
- `/api/health/*` - Health checks

### Order Service (Port 3002)
- `/api/order/*` - Order management
- `/api/cart/*` - Shopping cart

## Environment Variables

```env
PORT=3000
BACKEND_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
CORS_ORIGIN=*
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting (IP-based)
RATE_LIMIT_TTL=60000           # Time window in milliseconds (default: 60000ms = 60s)
RATE_LIMIT_MAX=100             # Maximum requests per IP per time window (default: 100)
```

## Development

```bash
# Run in development mode
pnpm dev

# Build
pnpm build

# Start production
pnpm start:prod
```

## Authentication

The API Gateway verifies JWT tokens and extracts the user ID to set the `x-user-id` header for downstream services.

### Protected Routes
All routes except the following are protected by JWT authentication:
- `/auth/*` - Authentication endpoints (signup, login, refresh)
- `/public/*` - Public endpoints
- `/health/*` - Health check endpoints

### Authentication Flow
1. Client sends request with `Authorization: Bearer <token>` header
2. API Gateway verifies the JWT token using the `JWT_SECRET`
3. API Gateway extracts user ID from token payload (`sub` field)
4. API Gateway sets `x-user-id` header with the extracted user ID
5. Request is forwarded to the appropriate backend service

## Future Enhancements

- [x] JWT verification middleware
- [x] IP-based rate limiting
- [ ] Request/response logging
- [ ] Circuit breaker pattern
- [ ] Load balancing

## Rate Limiting

The API Gateway implements **IP-based rate limiting** to protect backend services from abuse and ensure fair usage.

### How It Works

- **Tracking**: Requests are tracked by client IP address
- **IP Detection**: Supports both direct connections and proxied requests
  - Checks `X-Forwarded-For` header (for load balancers/proxies)
  - Falls back to `X-Real-IP` header
  - Uses socket IP as final fallback
- **Blocking**: Requests exceeding the limit receive a `429 Too Many Requests` response
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed per window
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)
  - `Retry-After`: Seconds until the rate limit resets (on 429 responses)

### Configuration

Rate limiting is configured via environment variables:

- `RATE_LIMIT_TTL`: Time window in milliseconds (default: 60000 = 60 seconds)
- `RATE_LIMIT_MAX`: Maximum requests per IP per time window (default: 100)

**Example configurations:**

```bash
# Strict limits: 50 requests per 30 seconds
RATE_LIMIT_TTL=30000
RATE_LIMIT_MAX=50

# Relaxed limits: 200 requests per 2 minutes
RATE_LIMIT_TTL=120000
RATE_LIMIT_MAX=200

# Default: 100 requests per 60 seconds
# (no env vars needed)
```

### Response Example

When rate limit is exceeded, clients receive:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

With headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1738448523
Retry-After: 60
```

### Backend Independence

- **Zero modifications** to backend services required
- Rate limiting is applied at the gateway level
- Backend services remain unaware of rate limiting logic
- Can be easily enabled/disabled by deploying/removing the gateway
