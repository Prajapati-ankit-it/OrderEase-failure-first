# OrderEase Backend Architecture

## Overview

The OrderEase backend is built using **NestJS** with a modular architecture that follows best practices for scalability, maintainability, and security. While implemented as a modular monolith, the architecture is designed to be easily scalable to microservices if needed.

## Architecture Pattern: Modular Monolith

The application follows a **modular monolith** pattern with clear service boundaries that can be extracted into microservices in the future. This approach provides:

- **Clear separation of concerns** - Each module handles a specific domain
- **Independent development** - Teams can work on different modules independently
- **Easier testing** - Modules can be tested in isolation
- **Scalable architecture** - Can evolve to microservices as needed
- **Reduced complexity** - Simpler than full microservices for current scale

## Technology Stack

- **Framework**: NestJS (Node.js TypeScript framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer
- **API Documentation**: REST API with standardized responses

## Core Modules

### 1. API Gateway Layer

The API Gateway provides centralized functionality for all incoming requests:

#### Components:
- **Logging Interceptor** (`gateway/logging.interceptor.ts`)
  - Logs all incoming requests with method, URL, IP, and user agent
  - Logs response times
  - Sanitizes sensitive data (passwords, tokens) from logs
  - Tracks errors with stack traces

- **Global Exception Filter** (`gateway/exception.filter.ts`)
  - Centralized error handling for all exceptions
  - Standardized error response format
  - Handles HTTP exceptions, validation errors, and database errors
  - Provides meaningful error codes and messages

- **Rate Limiting Middleware** (`gateway/rate-limit.middleware.ts`)
  - Basic in-memory rate limiting (100 requests per 15 minutes)
  - IP-based request throttling
  - Protects against DDoS and brute force attacks
  - Can be upgraded to Redis-based solution for production

#### Features:
- ✅ Request/Response logging
- ✅ Centralized error handling
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation
- ✅ Security headers

### 2. Authentication Module (`auth/`)

Handles user authentication and authorization using JWT tokens.

#### Features:
- User signup with password hashing (bcrypt)
- User login with credential validation
- JWT access and refresh tokens
- Token refresh endpoint
- Role-based access control (RBAC)

#### Key Files:
- `auth.service.ts` - Authentication business logic
- `auth.controller.ts` - Auth endpoints
- `jwt.strategy.ts` - Passport JWT strategy
- `jwt-auth.guard.ts` - JWT authentication guard
- `roles.guard.ts` - Role-based authorization guard

#### Decorators:
- `@Auth()` - Requires authentication (any role)
- `@Auth(Role.ADMIN)` - Requires ADMIN role
- `@CurrentUser()` - Extracts current user from request

### 3. User Module (`user/`)

Manages user profiles and user-specific operations.

#### Features:
- Get user profile
- Update user profile
- Change password
- Get user's order history

#### Endpoints:
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password
- `GET /api/user/orders` - Get user's orders (paginated)

### 4. Admin Module (`admin/`)

Administrative functions for managing the platform.

#### Features:
- Admin dashboard with statistics
- User management (list, view, update, delete)
- User role management
- System-wide overview

#### Endpoints:
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

### 5. Food Module (`food/`)

Manages food items and menu (Admin only).

#### Features:
- CRUD operations for food items
- Category-based filtering
- Availability management
- Price management

#### Endpoints:
- `POST /api/food` - Create food item (Admin)
- `GET /api/food` - List all food items (Admin)
- `GET /api/food/:id` - Get food item by ID (Admin)
- `PUT /api/food/:id` - Update food item (Admin)
- `DELETE /api/food/:id` - Delete food item (Admin)

### 6. Cart Module (`cart/`)

Shopping cart management for authenticated users.

#### Features:
- Add items to cart
- Update item quantities
- Remove items from cart
- Clear entire cart
- Calculate total price
- Automatic cart creation per user

#### Endpoints:
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

#### Business Logic:
- One cart per user
- Validates food availability before adding
- Prevents adding unavailable items
- Automatically calculates totals
- Supports quantity updates (0 = remove item)

### 7. Order Module (`order/`)

Order processing and management.

#### Features:
- Create order with custom items
- Create order from cart (recommended flow)
- Order status management
- Order history
- Admin order management

#### Endpoints:
- `POST /api/order` - Create order with items
- `POST /api/order/from-cart` - Create order from cart
- `GET /api/order` - List all orders (Admin, paginated)
- `GET /api/order/:id` - Get order by ID
- `PUT /api/order/:id/status` - Update order status (Admin)
- `DELETE /api/order/:id` - Delete order (Admin)

#### Order Statuses:
- `PENDING` - Order placed, awaiting preparation
- `PREPARING` - Order being prepared
- `READY` - Order ready for pickup/delivery
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

### 8. Public Module (`public/`)

Public endpoints that don't require authentication.

#### Features:
- View available menu items
- View food categories
- Health check endpoint

#### Endpoints:
- `GET /api/public/health` - Health check
- `GET /api/public/menu` - Get available menu items
- `GET /api/public/menu/:id` - Get menu item by ID
- `GET /api/public/categories` - Get food categories

### 9. Database Module (`database/`)

Prisma ORM integration and database management.

#### Features:
- Centralized database connection
- Type-safe database queries
- Schema migrations
- Database seeding

#### Models:
- `User` - User accounts with roles
- `Food` - Food items/menu
- `Cart` - User shopping carts
- `CartItem` - Items in cart
- `Order` - Customer orders
- `OrderItem` - Items in order

## Data Flow

### User Order Flow

```
1. User browses menu → Public Module
2. User adds items to cart → Cart Module
3. Cart validates food availability → Food Module
4. User creates order from cart → Order Module
5. Order created, cart cleared → Cart Module
6. Admin updates order status → Order Module
```

### Admin Food Management Flow

```
1. Admin logs in → Auth Module
2. Admin creates/updates food item → Food Module
3. Food availability updated → Database
4. Changes reflected in Public Module
5. Cart validates against updated data
```

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, USER)
- Password hashing with bcrypt (10 salt rounds)
- Secure token generation and validation
- Refresh token support for extended sessions

### Input Validation
- Global validation pipe with class-validator
- DTO-based validation for all endpoints
- Whitelist mode (strips unknown properties)
- Type transformation and coercion
- Custom validation rules

### Rate Limiting
- IP-based request throttling
- Configurable limits per endpoint
- Protection against brute force attacks
- Automatic cleanup of old request records

### Error Handling
- Centralized exception handling
- No sensitive data in error responses
- Structured error format with codes
- Proper HTTP status codes
- Stack trace logging (server-side only)

### Database Security
- Parameterized queries via Prisma
- No SQL injection vulnerabilities
- Cascade deletes for data integrity
- Unique constraints on critical fields
- Foreign key relationships

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-01-03T18:00:00.000Z",
  "path": "/api/endpoint",
  "message": "Error message",
  "errorCode": "ERROR_CODE"
}
```

## Configuration

The application uses environment-based configuration:

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/orderease"

# JWT
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3001"
```

## Database Schema

### User
- Stores user accounts
- Supports role-based access
- One-to-many with Orders and Cart

### Food
- Menu items with pricing
- Category-based organization
- Availability flag
- One-to-many with OrderItems and CartItems

### Cart & CartItem
- One cart per user
- Many items per cart
- Validates food availability

### Order & OrderItem
- Stores completed orders
- Maintains order history
- Tracks order status
- Links to user and food items

## Future Scalability

### Microservices Migration Path

The current modular architecture can be migrated to microservices:

1. **Extract Auth Service**
   - Independent authentication service
   - Shared JWT validation
   - User management

2. **Extract Order Service**
   - Order processing logic
   - Event-driven communication
   - Saga pattern for transactions

3. **Extract Food/Menu Service**
   - Menu management
   - Cache layer for performance
   - CDN for images

4. **Extract Cart Service**
   - Session-based or Redis-backed
   - Real-time updates
   - Event notifications

5. **API Gateway Enhancement**
   - Service discovery
   - Load balancing
   - Circuit breakers
   - Advanced rate limiting (Redis)

### Recommended Enhancements

- **Caching**: Redis for frequently accessed data
- **Message Queue**: RabbitMQ or Kafka for async operations
- **File Storage**: S3 for food images
- **Email Service**: SendGrid for notifications
- **Payment Gateway**: Stripe or Razorpay integration
- **Analytics**: ELK stack for logging and monitoring
- **Containerization**: Docker and Kubernetes

## Development Guidelines

### Code Organization
- One feature per module
- Clear separation of concerns
- DTOs for validation
- Services for business logic
- Controllers for routing

### Testing Strategy
- Unit tests for services
- Integration tests for controllers
- E2E tests for critical flows
- Test database for isolation

### Best Practices
- Follow SOLID principles
- Use dependency injection
- Implement proper error handling
- Write meaningful comments
- Keep functions small and focused
- Use TypeScript strictly

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Build & Run
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Build application
npm run build

# Start production
npm run start:prod
```

### Health Checks
- `GET /api/public/health` - Application health
- Database connection validation
- Environment configuration check

## Monitoring & Logging

- Request/response logging via interceptor
- Error tracking with stack traces
- Performance metrics (response times)
- Database query logging (Prisma)
- Environment-based log levels

## Conclusion

This architecture provides a solid foundation for the OrderEase platform. It's production-ready, scalable, and maintainable while remaining simple enough for the current requirements. The modular design allows for easy feature additions and future migration to microservices if needed.
