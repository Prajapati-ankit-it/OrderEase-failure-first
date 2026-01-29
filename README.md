# OrderEase - Restaurant Ordering System

> **🎯 Monorepo Architecture**: This project has been migrated to a pnpm workspace-based monorepo. See [ARCHITECTURE.md](./doc/ARCHITECTURE.md) for detailed architecture documentation.

A production-grade restaurant ordering system built on a **Modular Monolith** architecture. Designed for high-concurrency order processing with event-sourced order tracking, integer-based financial precision, and built-in idempotency.

## 📖 Table of Contents

- [Overview](#-overview)
- [Monorepo Architecture](#-monorepo-architecture)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
  - [Modular Monolith Design](#modular-monolith-design)
  - [Financial Integrity](#financial-integrity)
  - [Event Sourcing](#event-sourcing)
  - [Idempotency](#idempotency)
  - [Resiliency](#resiliency)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🏗️ Monorepo Architecture

OrderEase now uses a **pnpm workspace-based monorepo** for better code organization and scalability:

```
orderease/
├── apps/
│   ├── api-gateway/        # HTTP routing & authentication
│   ├── backend/            # Auth, User, Admin, Food services
│   ├── order-service/      # Order & Cart domain services
│   └── payment-service/    # Payment service (future)
└── packages/
    ├── shared-dtos/        # All DTOs
    ├── shared-types/       # Enums, interfaces, constants
    ├── shared-utils/       # Pure utilities
    ├── shared-errors/      # Domain errors
    └── shared-config/      # Configuration validation
```

📖 **See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete architecture documentation**

## 🎯 Overview

OrderEase is a high-concurrency restaurant ordering platform with strict financial guarantees. Built for developers who need to understand **how** failures are handled and **why** specific patterns were chosen.

**Core Decisions:**
- **Modular Monolith**: All services in a single deployable unit. Simple ops, clear boundaries.
- **Event Sourcing**: Order lifecycle tracked as append-only events. No lost state.
- **Int-based Currency**: All amounts stored as cents. IEEE-754 precision issues avoided.
- **Idempotency**: Hash-based duplicate detection. Safe retries on network failures.
- **Recovery Workers**: Background jobs reconcile stuck payments and refunds.

## 🚀 Key Features

### Customer Features
- 📱 **Browse Menu**: View menu items organized by categories (Starters, Main Course, Desserts, Drinks, etc.)
- 🛒 **Shopping Cart**: Add/remove items, adjust quantities, view cart summary
- 📝 **Order Placement**: Create orders with dine-in or delivery options
- ✅ **Order Tracking**: View order confirmation and real-time order status
- 💳 **Responsive Design**: Mobile-first design that works on all devices

### Admin Features
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 📊 **Dashboard Analytics**: View order statistics, revenue tracking, and key metrics
- 📋 **Menu Management**: Full CRUD operations for menu items with categories
- 🍽️ **Order Management**: View all orders and update status (Pending → Preparing → Ready → Delivered)
- 👤 **User Management**: Manage user accounts and roles
- 🔐 **RBAC Protection**: Role-based access to admin-only features

## 🏗️ Architecture

OrderEase implements a **Modular Monolith** with event-sourced order management. This section explains the key architectural patterns.

### Modular Monolith Design

Single deployment unit with clear module boundaries:

```
apps/backend/src/
├── order/          # Order domain (event-sourced)
│   ├── domain/     # State machine, transitions, rules
│   ├── application # Orchestrators, recovery workers
│   └── infra/      # Repository, payment gateway
├── auth/           # Authentication
├── user/           # User management
├── admin/          # Admin operations
└── food/           # Menu catalog
```

**Why Monolith:**
- Simplified deployment and operations
- Transactions span modules without distributed coordination
- Easier debugging and tracing
- Can extract to microservices later if needed

### Financial Integrity

All monetary values stored as **integers in cents**, not floats.

```typescript
// Schema
model Food {
  price Int  // 1000 = $10.00
}

model Payment {
  amount Int // 2599 = $25.99
}
```

**Why Int over Float:**
- **IEEE-754 Issue**: `0.1 + 0.2 !== 0.3` in floating-point arithmetic
- **Accumulation**: Rounding errors compound over many operations
- **Auditability**: Exact penny-level precision required for financial records

**Example Problem (Float):**
```typescript
let total = 0.0;
total += 10.01; // $10.01
total += 20.02; // $20.02
// Expected: $30.03
// Actual:   $30.029999999999998
```

**Solution (Int):**
```typescript
let totalCents = 0;
totalCents += 1001; // $10.01
totalCents += 2002; // $20.02
// Result: 3003 cents = $30.03 (exact)
```

### Event Sourcing

Orders are tracked as an **append-only event log**. The `OrderEvent` table is the source of truth.

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

**Order State Derivation:**
```typescript
function deriveOrderState(events: OrderEvent[]): OrderState {
  // Fold events left-to-right to compute current state
  return events.reduce((state, event) => {
    return applyTransition(state, event.type);
  }, OrderState.PENDING);
}
```

**Benefits:**
- **Audit Trail**: Full history of what happened and when
- **Debugging**: Replay events to reproduce any state
- **Recovery**: Workers query event log to find stuck orders
- **Immutability**: Past events never change, only append new ones

### Idempotency

API requests are deduplicated using a client-provided `idempotencyKey`:

```typescript
POST /api/order/checkout
{
  "idempotencyKey": "checkout_20240115_user123_abc789"
}
```

**Mechanism:**
1. Client generates unique key (e.g., hash of cart contents + timestamp)
2. Backend checks `IdempotencyKey` table for existing key
3. If found, returns cached response without re-executing
4. If new, processes request and stores result

**Database Schema:**
```typescript
model IdempotencyKey {
  key         String @id
  requestHash String
  response    Json
  createdAt   DateTime
}
```

**Why This Matters:**
- **Network Failures**: Client can retry safely if request times out
- **Duplicate Clicks**: User clicking "Place Order" twice won't create two orders
- **Distributed Systems**: Safe retries without complex distributed locking

### Resiliency

#### OrderEvent as Source of Truth

All order state is derived from events. If a payment gets stuck, we can always:
1. Query `OrderEvent` table for the order
2. Derive current state
3. Determine what recovery action is needed

#### PaymentRecoveryWorker

Background job runs every minute to find and recover stuck payments:

```typescript
class PaymentRecoveryWorker {
  async run() {
    const stuckPayments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.INITIATED,
        createdAt: { lt: oneMinuteAgo }
      }
    });

    for (const payment of stuckPayments) {
      await paymentGateway.processPayment(payment.id);
    }
  }
}
```

**Recovery Scenarios:**
- **Payment initiated but gateway call failed**: Worker retries
- **Gateway processed but webhook lost**: Worker polls gateway status
- **Database transaction failed mid-flow**: Events ensure we can resume

#### RefundRecoveryWorker

Similar pattern for refunds on cancelled orders:

```typescript
class RefundRecoveryWorker {
  async run() {
    const needsRefund = await prisma.orderEvent.findMany({
      where: {
        type: OrderEventType.ORDER_CANCELLED,
        // No corresponding PAYMENT_REFUNDED event
      }
    });

    for (const event of needsRefund) {
      await refundOrchestrator.initiateRefund(event.orderId);
    }
  }
}
```

**Key Insight:**
Event log enables "eventual consistency" recovery patterns without complex sagas or compensating transactions.

### Failure Scenarios

How the system handles common failure modes:

| Failure | Detection | Recovery | Outcome |
|---------|-----------|----------|---------|
| **Payment gateway timeout** | No `PAYMENT_SUCCEEDED` event | `PaymentRecoveryWorker` polls gateway | Payment eventually confirmed or failed |
| **Database transaction aborted** | Events rolled back | Idempotency key allows retry | Client retries, no duplicate order |
| **Duplicate order submission** | Idempotency key match | Return existing `orderId` | Same order returned, no side effects |
| **Order cancelled after payment** | `ORDER_CANCELLED` event emitted | `RefundRecoveryWorker` initiates refund | Refund processed, `PAYMENT_REFUNDED` event |
| **Worker crash during recovery** | Worker restarts | Re-query stuck payments | Eventually consistent, no lost work |

## 🛠️ Tech Stack

**Core:**
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- React 18 + Redux Toolkit
- pnpm workspaces

**Key Libraries:**
- JWT for authentication
- bcrypt for password hashing
- class-validator for DTO validation
- Tailwind CSS for styling

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+ (`npm install -g pnpm`)
- PostgreSQL 14+ (or Railway/Supabase)

## 🔧 Local Setup

Quick setup for local development with pnpm workspaces.

### Prerequisites

```bash
# Node.js 18+
node --version

# pnpm 8+
pnpm --version
# If missing: npm install -g pnpm

# PostgreSQL 14+
psql --version
```

### 1. Clone and Install

```bash
git clone https://github.com/TECH-SIGN/OrderEase.git
cd OrderEase
pnpm install
```

### 2. Database Setup

**Local PostgreSQL:**
```bash
psql -U postgres
CREATE DATABASE orderease;
\q
```

**Or use Railway/Supabase** and grab the connection string.

### 3. Environment Configuration

**Backend:**
```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/orderease"
JWT_SECRET="generate_with_openssl_rand_base64_32"
JWT_REFRESH_SECRET="generate_with_openssl_rand_base64_32"
PORT=3001
```

**Frontend** (if running separately):
```bash
cd apps/frontend
cp .env.example .env
```

Edit to point to backend:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Initialize Database

```bash
cd apps/backend

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Seed data (creates admin@orderease.com / admin123)
pnpm prisma db seed
```

### 5. Start Services

**All services:**
```bash
# From root
pnpm dev
```

**Individual services:**
```bash
pnpm --filter @orderease/backend dev
pnpm --filter @orderease/order-service dev
pnpm --filter @orderease/api-gateway dev
```

**Check health:**
```bash
curl http://localhost:3001/health
```

### Seed Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@orderease.com | admin123 | ADMIN |
| user@orderease.com | user123 | USER |
[Nest] 12345  - 01/05/2026, 8:25:41 PM     LOG [NestApplication] Nest application successfully started
Server is running on: http://localhost:3000
API endpoints: http://localhost:3000/api
```

### Start the Frontend Development Server

Open a **new terminal window** (keep the backend running):

```bash
# Navigate to frontend directory
cd frontend

# Start the React development server
npm start
```

The application will automatically open in your default browser at:
- **Frontend**: `http://localhost:3001`
- **Backend API**: `http://localhost:3000/api`

### Verify Everything is Working

1. **Check Backend Health**:
   ```bash
   curl http://localhost:3000/api/public/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Frontend**:
   - Open `http://localhost:3001` in your browser
   - You should see the OrderEase homepage with menu items

3. **Test Login**:
   - Click "Admin" in the navigation bar
   - Login with `admin@orderease.com` / `admin123`
   - You should be redirected to the admin dashboard

### Common Commands

**Backend Commands:**
```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Build the application
npm run build

# Run tests
npm run test

# Database commands
npm run prisma:studio        # Open Prisma Studio (database GUI)
npm run prisma:migrate      # Run migrations
npm run prisma:seed         # Seed database
npm run db:setup            # One command to setup everything
```

**Frontend Commands:**
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test -- --coverage
```

**Root-Level Commands:**
```bash
# Install all dependencies (backend + frontend)
npm run install-all

# Start both backend and frontend concurrently
npm run dev

# Seed backend database
npm run seed
```

## 📚 API Documentation

Base URL: `http://localhost:3001/api`

**Authentication:** Include JWT token in headers:
```
Authorization: Bearer <token>
```

### Key Endpoints

**Checkout (with idempotency):**
```bash
POST /api/order/checkout
{
  "idempotencyKey": "checkout_user123_20240115_abc789"
}
```

**Add to Cart:**
```bash
POST /api/cart
{
  "foodId": "clx...",
  "quantity": 2
}
```

**Browse Menu:**
```bash
GET /api/public/menu
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 409 | Conflict (e.g., duplicate idempotency key) |
| 500 | Internal server error |

Full API reference: See `apps/backend/API.md`

## 🔧 Troubleshooting

**Database Connection Issues:**
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify DATABASE_URL in apps/backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/orderease"
```

**Port Already in Use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port in .env
PORT=3002
```

**Prisma Issues:**
```bash
# Regenerate client
cd apps/backend
pnpm prisma generate

# Reset database
pnpm prisma migrate reset
```

**Build Failures:**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild shared packages
pnpm --filter "@orderease/shared-*" build
```

## 🤝 Contributing

See `CONTRIBUTING.md` for guidelines.

---

Made with ❤️ by TechSign
