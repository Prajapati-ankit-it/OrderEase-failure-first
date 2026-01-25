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
- [ ] Rate limiting
- [ ] Request/response logging
- [ ] Circuit breaker pattern
- [ ] Load balancing
