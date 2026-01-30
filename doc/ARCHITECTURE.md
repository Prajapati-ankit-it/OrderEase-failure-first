# OrderEase Monorepo - Architecture Guide

## 📐 Architecture Overview

OrderEase is a **Modular Monolith** built for high-concurrency order processing with event-sourced order tracking, integer-based financial precision, and idempotent APIs.

### Key Architectural Decisions

1. **Modular Monolith**: Single deployment with clear domain boundaries
2. **Event Sourcing**: Order lifecycle tracked as append-only event log
3. **Integer Currency**: All amounts in cents (avoids IEEE-754 precision issues)
4. **Idempotency**: Hash-based duplicate detection for safe retries
5. **Recovery Workers**: Background jobs reconcile stuck payments/refunds

## 🎯 Core Principles

### 1. Single Source of Truth
- **DTOs**: Defined once in `packages/shared-dtos`
- **Types/Enums**: Defined once in `packages/shared-types`
- **Utilities**: Defined once in `packages/shared-utils`
- **Errors**: Defined once in `packages/shared-errors`
- **Config**: Defined once in `packages/shared-config`

### 2. No Code Duplication
- Services import from shared packages via workspace aliases
- No DTO definitions in `apps/*`
- No duplicate utilities or types

### 3. Clear Boundaries
```
packages/     → Shared code (DTOs, types, utils, errors, config)
apps/         → Business logic, services, controllers, repositories
```

## 📦 Package Structure

### packages/shared-dtos
**Purpose**: All Data Transfer Objects for API contracts

**Contents**:
- `auth.dto.ts` - SignUpDto, LoginDto
- `user.dto.ts` - UpdateProfileDto, UpdatePasswordDto
- `admin.dto.ts` - UpdateUserRoleDto, AdminUpdateUserDto
- `food.dto.ts` - CreateFoodDto, UpdateFoodDto
- `cart.dto.ts` - AddToCartDto, UpdateCartItemDto
- `order.dto.ts` - CreateOrderDto, CreateOrderFromCartDto, UpdateOrderStatusDto, OrderStatus

**Usage**:
```typescript
import { SignUpDto, CreateOrderDto } from '@orderease/shared-dtos';
```

### packages/shared-types
**Purpose**: Common types, enums, and constants

**Contents**:
- `constants.ts` - Role enum, MESSAGES, ERROR_CODES

**Usage**:
```typescript
import { Role, MESSAGES, ERROR_CODES } from '@orderease/shared-types';
```

### packages/shared-utils
**Purpose**: Pure utility functions (no business logic)

**Contents**:
- `password.util.ts` - hashPassword, comparePassword
- `jwt.util.ts` - parseJwt
- `response.util.ts` - successResponse, errorResponse

**Usage**:
```typescript
import { hashPassword, successResponse } from '@orderease/shared-utils';
```

### packages/shared-errors
**Purpose**: Domain error classes

**Contents**:
- `domain-errors.ts` - BaseDomainError, OrderDomainError, CartDomainError, etc.

**Usage**:
```typescript
import { OrderDomainError } from '@orderease/shared-errors';
```

### packages/shared-config
**Purpose**: Environment validation schemas

**Contents**:
- `env.schema.ts` - Zod schemas for environment variables

**Usage**:
```typescript
import { envSchema } from '@orderease/shared-config';
```

## 🏢 Service Architecture

### apps/backend
**Responsibility**: Non-order business services

**Modules**:
- `auth/` - Authentication (signup, login, JWT)
- `user/` - User profile management
- `admin/` - Admin dashboard, user management
- `food/` - Menu catalog management
- `health/` - Health checks
- `public/` - Public endpoints

**Database**: PostgreSQL via Prisma
**Port**: 3001

### apps/order-service
**Responsibility**: Order domain services

**Modules**:
- `order/` - Order creation, management, status updates
- `cart/` - Shopping cart operations
- `food/` - Food repository (temporary - will use HTTP to backend)

**Database**: PostgreSQL via Prisma
**Port**: 3002

### apps/api-gateway
**Responsibility**: HTTP routing and authentication

**Features**:
- Routes requests to appropriate services
- JWT verification (planned)
- Rate limiting (planned)

**Routes**:
- `/api/auth/*`, `/api/user/*`, `/api/admin/*`, `/api/food/*` → backend (3001)
- `/api/order/*`, `/api/cart/*` → order-service (3002)

**Port**: 3000

### apps/payment-service
**Responsibility**: Payment processing (stub)

**Status**: Placeholder for future implementation

## 🔄 Import Patterns

### ✅ Correct (Workspace Aliases)
```typescript
// DTOs
import { CreateOrderDto } from '@orderease/shared-dtos';

// Types
import { Role } from '@orderease/shared-types';

// Utils
import { hashPassword } from '@orderease/shared-utils';

// Errors
import { OrderDomainError } from '@orderease/shared-errors';

// Config
import { envSchema } from '@orderease/shared-config';
```

### ❌ Incorrect (Relative Paths to Shared Code)
```typescript
// Never do this!
import { CreateOrderDto } from './dto';
import { Role } from '../constants';
import { hashPassword } from '../../utils';
```

## 🚀 Development Workflow

### Build All Packages
```bash
pnpm build
```

### Build Shared Packages Only
```bash
pnpm --filter "@orderease/shared-*" build
```

### Run Services
```bash
# Backend service
pnpm --filter @orderease/backend dev

# Order service
pnpm --filter @orderease/order-service dev

# API Gateway
pnpm --filter @orderease/api-gateway dev
```

### Add Dependencies

**To a specific service:**
```bash
pnpm --filter @orderease/backend add <package-name>
```

**To a shared package:**
```bash
pnpm --filter @orderease/shared-dtos add <package-name>
```

## 🔄 Event Sourcing & Financial Integrity

### Event-Sourced Order Lifecycle

Orders use **event sourcing** — the `OrderEvent` table is the source of truth. Order state is derived by replaying events.

**Event Types:**
```typescript
enum OrderEventType {
  ORDER_REQUESTED      // User initiates checkout
  ORDER_VALIDATED      // Cart validated, items snapshotted
  PAYMENT_INITIATED    // Payment record created
  PAYMENT_SUCCEEDED    // Gateway confirmed payment
  PAYMENT_FAILED       // Gateway rejected payment
  ORDER_CONFIRMED      // Order finalized
  ORDER_CANCELLED      // User/admin cancelled
  PAYMENT_REFUNDED     // Refund completed
}
```

**State Derivation:**
```typescript
function deriveOrderState(events: OrderEvent[]): OrderState {
  return events.reduce((state, event) => {
    return applyTransition(state, event.type);
  }, OrderState.PENDING);
}
```

**Why Event Sourcing:**
- **Audit Trail**: Full history of order progression
- **Debugging**: Replay events to reproduce any state
- **Recovery**: Workers query events to find stuck orders
- **Immutability**: Past events never change

### Integer-Based Currency (No Floats)

All monetary values stored as **integers in cents**:

```prisma
model Food {
  price Int  // 1000 = $10.00
}

model Payment {
  amount Int // 2599 = $25.99
}
```

**Why Integer over Float:**
- **IEEE-754 Problem**: `0.1 + 0.2 !== 0.3` in floating-point
- **Accumulation**: Rounding errors compound over many operations
- **Auditability**: Exact penny-level precision for financial records

**Example:**
```typescript
// Float (WRONG)
let total = 0.0;
total += 10.01; // $10.01
total += 20.02; // $20.02
// Result: $30.029999999999998 ❌

// Int (CORRECT)
let totalCents = 0;
totalCents += 1001; // $10.01
totalCents += 2002; // $20.02
// Result: 3003 cents = $30.03 ✅
```

### Idempotency

Client-provided idempotency keys prevent duplicate orders:

```typescript
POST /api/order/checkout
{
  "idempotencyKey": "checkout_user123_20240115_abc789"
}
```

**Mechanism:**
1. Client generates unique key (hash of cart + timestamp)
2. Backend checks `IdempotencyKey` table
3. If exists, return cached response
4. If new, process and store result

**Schema:**
```prisma
model IdempotencyKey {
  key         String @id
  requestHash String
  response    Json
  createdAt   DateTime
}
```

### Recovery Workers

**PaymentRecoveryWorker:**
Finds payments stuck in `INITIATED` status and retries gateway processing.

```typescript
async run() {
  const stuck = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.INITIATED,
      createdAt: { lt: oneMinuteAgo }
    }
  });
  
  for (const payment of stuck) {
    await gateway.processPayment(payment.id);
  }
}
```

**RefundRecoveryWorker:**
Finds cancelled orders without refunds and initiates them.

**Key Insight:** Event log enables "eventual consistency" recovery without sagas.

## 📋 Architecture Rules

### ✅ DO

1. **Put DTOs in shared-dtos**
   - All request/response contracts
   - Validation decorators included

2. **Put types/enums in shared-types**
   - Role enums
   - Constants
   - Interfaces

3. **Put utilities in shared-utils**
   - Pure functions only
   - No business logic
   - No database access

4. **Use workspace aliases for imports**
   - `@orderease/shared-*`
   - Never relative paths to packages

5. **Keep business logic in apps**
   - Controllers
   - Services
   - Repositories
   - Domain entities

### ❌ DON'T

1. **Don't create DTOs in apps/**
   - All DTOs belong in `packages/shared-dtos`

2. **Don't put business logic in packages**
   - No services
   - No repositories
   - No controllers
   - No database access

3. **Don't duplicate code**
   - Single source of truth for all shared code

4. **Don't mix concerns**
   - Backend: user/auth/admin/food
   - Order-service: orders/cart only

5. **Don't use relative imports for shared code**
   - Always use `@orderease/*` aliases

## 🎓 Benefits

### Scalability
- Easy to add new services
- Each service can scale independently
- Clear boundaries enable team distribution

### Maintainability
- Single source of truth eliminates confusion
- Type safety across services
- Easy to locate and update code

### Reliability
- No duplicate code means fewer bugs
- Shared validation ensures consistency
- Clean architecture enables easier testing

### Developer Experience
- Clear structure is easy to understand
- Workspace aliases make imports clean
- TypeScript provides excellent IDE support

## 🔮 Future Enhancements

1. **API Gateway**
   - JWT verification middleware
   - Rate limiting
   - Request logging

2. **Service Communication**
   - Replace Food module duplication with HTTP calls
   - Implement service-to-service authentication

3. **Payment Service**
   - Payment processing logic
   - Transaction management
   - Payment provider integration

4. **Infrastructure**
   - Docker Compose for local development
   - CI/CD pipeline
   - Automated testing

## 📚 Additional Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Monorepo Best Practices](https://monorepo.tools/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
