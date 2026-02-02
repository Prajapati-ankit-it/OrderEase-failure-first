# OrderEase API Gateway

Minimal NestJS-based API Gateway for HTTP routing, IP-based rate limiting, and request forwarding.

## Responsibilities

- IP-based rate limiting to protect backend services
- HTTP routing to backend services
- Request forwarding (transparent proxy)

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
PORT=4000
BACKEND_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3002
CORS_ORIGIN=*

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

## Architecture

The API Gateway is a simple, transparent proxy that:
1. Applies IP-based rate limiting on all incoming requests
2. Forwards allowed requests to backend services
3. Returns responses from backend services

**Note:** Authentication and authorization are handled by the backend services, not the gateway. The gateway only enforces rate limits.

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
  - `X-RateLimit-Limit-short`: Maximum requests allowed per window
  - `X-RateLimit-Remaining-short`: Requests remaining in current window
  - `X-RateLimit-Reset-short`: Seconds until the rate limit resets
  - `Retry-After-short`: Seconds until the rate limit resets (on 429 responses)

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
X-RateLimit-Limit-short: 100
X-RateLimit-Remaining-short: 0
X-RateLimit-Reset-short: 60
Retry-After-short: 60
```

### Backend Independence

- **Zero modifications** to backend services required
- Rate limiting is applied at the gateway level
- Backend services remain unaware of rate limiting logic
- Can be easily enabled/disabled by deploying/removing the gateway

## Testing

```bash
# Run the automated rate limiting test
./test-rate-limit.sh
```

For more detailed information about rate limiting, deployment, and scaling, see [RATE_LIMITING.md](./RATE_LIMITING.md).
