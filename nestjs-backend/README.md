# OrderEase RBAC Backend

A complete Role-Based Access Control (RBAC) authentication & authorization system built with Nest.js, Prisma ORM, and PostgreSQL.

## 🏗️ Architecture

```
nestjs-backend/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── src/
│   ├── config/           # Configuration modules
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── constants/        # Application constants
│   │   └── index.ts
│   ├── database/         # Prisma service
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── utils/            # Utility functions
│   │   ├── password.util.ts
│   │   └── response.util.ts
│   ├── auth/             # Authentication module
│   │   ├── decorators/   # Custom decorators
│   │   │   ├── auth.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/          # Data Transfer Objects
│   │   │   ├── login.dto.ts
│   │   │   └── signup.dto.ts
│   │   ├── guards/       # Auth guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/   # Passport strategies
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── admin/            # Admin module (ADMIN only)
│   ├── user/             # User module (authenticated users)
│   ├── public/           # Public module (no auth required)
│   ├── food/             # Food management (ADMIN only)
│   ├── order/            # Order management
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
└── test/                 # E2E tests
```

## 🔐 RBAC Implementation

### Roles
- **ADMIN**: Restaurant owner with full access
- **USER**: Regular user who can order food

### Route Protection
- `/api/auth/*` - Public (authentication endpoints)
- `/api/public/*` - Public (open endpoints)
- `/api/user/*` - Protected (requires JWT - USER or ADMIN)
- `/api/admin/*` - Protected (requires JWT + ADMIN role)
- `/api/food/*` - Protected (ADMIN only)
- `/api/order/*` - Mixed (some endpoints require ADMIN)

### Decorators
- `@Auth()` - Requires authentication (any role)
- `@Auth(Role.ADMIN)` - Requires ADMIN role
- `@Roles(Role.ADMIN, Role.USER)` - Specify allowed roles
- `@CurrentUser()` - Get current user from request

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
cd nestjs-backend
npm install
```

### Configuration

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your settings:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/orderease?schema=public"
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production
JWT_REFRESH_EXPIRES_IN=30d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Or run all at once
npm run db:setup
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/health` | Health check |
| GET | `/api/public/menu` | Get available menu items |
| GET | `/api/public/menu/:id` | Get menu item by ID |
| GET | `/api/public/categories` | Get food categories |

### User (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/password` | Change password |
| GET | `/api/user/orders` | Get user's orders |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard stats |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user by ID |
| PUT | `/api/admin/users/:id` | Update user |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |

### Food (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/food` | Create food item |
| GET | `/api/food` | List all food items |
| GET | `/api/food/:id` | Get food item by ID |
| PUT | `/api/food/:id` | Update food item |
| DELETE | `/api/food/:id` | Delete food item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/order` | Create order (authenticated) |
| GET | `/api/order` | List orders (admin only) |
| GET | `/api/order/:id` | Get order by ID |
| PUT | `/api/order/:id/status` | Update order status (admin) |
| DELETE | `/api/order/:id` | Delete order (admin) |

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Refresh token support
- Role-based access control
- Input validation with class-validator
- CORS configuration
- Environment-based configuration

## 📝 Default Users (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@orderease.com | admin123 |
| USER | user@orderease.com | user123 |

## 🛠️ Scripts

```bash
npm run build          # Build the application
npm run start:dev      # Start in development mode
npm run start:prod     # Start in production mode
npm run lint           # Run ESLint
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:seed     # Seed the database
npm run prisma:studio   # Open Prisma Studio
npm run db:setup        # Full database setup
```

## 📖 License

MIT
