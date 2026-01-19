# OrderEase - Restaurant Ordering System

A modern, full-stack restaurant ordering system built with NestJS, React, PostgreSQL, and Prisma. This project demonstrates production-ready architecture with modular design, comprehensive authentication, role-based access control, and industry best practices.

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Docker Setup](#-docker-setup)
- [Local Setup](#-local-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

OrderEase is a comprehensive restaurant ordering platform that enables customers to browse menus, manage shopping carts, and place orders, while providing administrators with powerful tools for menu management, order processing, and business analytics. The system is built with scalability, security, and developer experience in mind.

**What makes OrderEase special:**
- **Production-Ready**: Built with enterprise-grade architecture patterns
- **Type-Safe**: Full TypeScript implementation across frontend and backend
- **Secure**: JWT authentication, RBAC, input validation, and security best practices
- **Modern Stack**: Latest versions of NestJS, React 18, and PostgreSQL with Prisma ORM
- **Well-Documented**: Comprehensive API documentation and inline code comments

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

OrderEase uses a **modular monolith architecture** with clear separation of concerns:

### Backend Architecture (NestJS)

The backend is located in `/backend/` and follows a modular, domain-driven design:

```
Gateway Layer (Interceptors, Guards, Filters)
    ↓
Controllers (HTTP request handling)
    ↓
Services (Business logic)
    ↓
Database Layer (Prisma ORM)
    ↓
PostgreSQL Database
```

**Key Architectural Components:**

- **API Gateway Layer**: Centralized logging, error handling, and rate limiting
- **Authentication Module**: JWT-based auth with access and refresh tokens
- **Authorization Guards**: Role-based access control (RBAC) with decorators
- **Service Modules**: Domain-separated services (Auth, User, Admin, Food, Cart, Order, Public)
- **Database Layer**: Prisma ORM with type-safe database access
- **Validation Layer**: DTO-based validation with class-validator

### Frontend Architecture (React)

The frontend is located in `/frontend/` and uses modern React patterns:

```
Pages (Route components)
    ↓
Components (Reusable UI)
    ↓
Redux Store (State management)
    ↓
API Services (HTTP client)
    ↓
Backend API
```

**Key Frontend Components:**

- **Redux Toolkit**: Centralized state management for auth, cart, and orders
- **React Router v6**: Client-side routing with protected routes
- **API Services**: Axios-based HTTP client with interceptors
- **Component Library**: Reusable UI components (Navbar, Cards, Forms, etc.)
- **Tailwind CSS**: Utility-first styling framework

## 🛠️ Tech Stack

### Backend (NestJS + PostgreSQL)
- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Reliable relational database
- **ORM**: [Prisma](https://www.prisma.io/) - Next-generation ORM with type safety
- **Authentication**: [JWT](https://jwt.io/) - JSON Web Tokens with refresh token support
- **Validation**: [class-validator](https://github.com/typestack/class-validator) - Decorator-based validation
- **Password Hashing**: [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Secure password hashing
- **API Documentation**: Comprehensive endpoint documentation in `/backend/API.md`

### Frontend (React)
- **Framework**: [React 18](https://react.dev/) - Modern UI library
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) - Simplified Redux
- **Routing**: [React Router v6](https://reactrouter.com/) - Client-side routing
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **Testing**: [React Testing Library](https://testing-library.com/react) - Component testing

### Development Tools
- **Package Manager**: npm (Node Package Manager)
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git
- **Database Management**: Prisma Studio (GUI for database)

## 📋 Prerequisites

Before setting up OrderEase, ensure you have the following installed on your system:

### Required Software

1. **Node.js (v18.x or higher)**
   - Download: [https://nodejs.org/](https://nodejs.org/)
   - Verify installation: `node --version`
   - Recommended: Use the LTS (Long Term Support) version

2. **PostgreSQL (v14.x or higher)**
   - Download: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - Verify installation: `psql --version`
   - Alternative: Use a cloud PostgreSQL service (Railway, Supabase, etc.)

3. **npm (v8.x or higher)**
   - Comes bundled with Node.js
   - Verify installation: `npm --version`

4. **Git (optional, for cloning)**
   - Download: [https://git-scm.com/](https://git-scm.com/)
   - Verify installation: `git --version`

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Disk Space**: At least 2GB free space for dependencies
- **Network**: Internet connection for installing packages

## � Docker Setup

OrderEase includes a production-ready Docker setup with NGINX reverse proxy, PostgreSQL database, and multi-stage builds. This is the recommended approach for both development and production.

### Prerequisites for Docker

1. **Docker Desktop** (or Docker Engine + Docker Compose)
   - Download: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Verify installation: `docker --version` and `docker-compose --version`

2. **Make** (optional, for convenient commands)
   - Most systems have make pre-installed
   - Verify: `make --version`

### Quick Start

The fastest way to get started is using the Makefile:

```bash
# For development
make quick-dev

# For production
make quick-prod
```

### Manual Docker Setup

#### Development Environment

1. **Copy environment file:**
   ```bash
   cp .env.docker .env
   # Edit .env with your configuration
   ```

2. **Start development containers:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Setup database:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npm run prisma:migrate
   docker-compose -f docker-compose.dev.yml exec backend npm run prisma:seed
   ```

#### Production Environment

1. **Copy and configure environment:**
   ```bash
   cp .env.docker .env
   # IMPORTANT: Update all secrets and passwords for production!
   ```

2. **Build and start production containers:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Setup database:**
   ```bash
   docker-compose exec backend npm run prisma:migrate:prod
   docker-compose exec backend npm run prisma:seed
   ```

### Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX (Port 80)                      │
│                   Reverse Proxy & Load Balancer             │
├─────────────────────────────────────────────────────────────┤
│  /api/* → Backend Service (Port 3000)                      │
│  /health → Health Check Endpoint                            │
│  /* → Frontend Service (Port 3001) [Optional]               │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌──────▼──────┐
            │   Backend      │  │  Database   │
            │   (NestJS)     │  │ (PostgreSQL)│
            │   Port 3000    │  │  Port 5432  │
            └────────────────┘  └─────────────┘
```

### Available Docker Commands

#### Using Makefile (Recommended)

```bash
# Development commands
make dev-build          # Build development containers
make dev-up             # Start development containers
make dev-logs           # Show development logs
make dev-down           # Stop development containers
make dev-clean          # Clean development containers

# Production commands
make prod-build         # Build production containers
make prod-up            # Start production containers
make prod-logs          # Show production logs
make prod-down          # Stop production containers
make prod-clean         # Clean production containers

# Database commands
make db-migrate         # Run database migrations
make db-seed            # Seed database with sample data
make db-studio          # Open Prisma Studio (dev only)
make db-reset           # Reset database (dev only)

# Utility commands
make status             # Show container status
make health             # Check health of all services
make shell-backend      # Open shell in backend container
make shell-db           # Open database shell
```

#### Manual Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose up -d
docker-compose logs -f
docker-compose down

# Database operations
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
docker-compose exec database psql -U postgres -d orderease
```

### Environment Variables for Docker

Key environment variables for Docker setup (see `.env.docker`):

```env
# Database
DB_NAME=orderease
DB_USER=postgres
DB_PASSWORD=change_this_secure_password
DB_PORT=5432

# JWT (Generate strong secrets!)
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_minimum_32_characters_long

# Application
NODE_ENV=production
BACKEND_PORT=3000
HTTP_PORT=80
HTTPS_PORT=443

# CORS
CORS_ORIGIN=http://localhost
```

### NGINX Reverse Proxy Configuration

The NGINX reverse proxy provides:

- **API Routing**: `/api/*` → Backend service
- **Rate Limiting**: 10 requests/second for API, 5 requests/minute for login
- **Security Headers**: XSS protection, content security policy, etc.
- **GZIP Compression**: Automatic compression for responses
- **Health Checks**: `/health` endpoint for monitoring
- **Load Balancing**: Ready for horizontal scaling

### Ports Exposed

- **80**: HTTP (NGINX reverse proxy)
- **443**: HTTPS (when SSL certificates are added)
- **3000**: Backend (direct access, not recommended in production)
- **5432**: PostgreSQL (for development/debugging)

### Volume Management

- **PostgreSQL Data**: Persistent database storage
- **Backend Uploads**: File upload storage
- **NGINX Logs**: Access and error logs
- **Source Code**: Development hot-reload (dev mode only)

### Production Considerations

1. **Security**: Update all passwords and secrets in `.env`
2. **SSL**: Add SSL certificates to NGINX for HTTPS
3. **Backups**: Implement database backup strategy
4. **Monitoring**: Add health check monitoring
5. **Scaling**: Ready for horizontal scaling with load balancer

## �🔧 Local Setup

Follow these steps to set up OrderEase on your local machine for the first time.

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/TECH-SIGN/OrderEase.git

# OR clone via SSH (if you have SSH keys set up)
git clone git@github.com:TECH-SIGN/OrderEase.git

# Navigate into the project directory
cd OrderEase
```

### Step 2: Setup PostgreSQL Database

**Option A: Local PostgreSQL**

1. Start PostgreSQL service:
   ```bash
   # On Windows (if installed as service)
   # PostgreSQL should start automatically
   
   # On macOS
   brew services start postgresql
   
   # On Linux
   sudo systemctl start postgresql
   ```

2. Create the database:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE orderease;
   
   # Exit psql
   \q
   ```

**Option B: Cloud PostgreSQL (Railway/Supabase)**

1. Create a free PostgreSQL database on [Railway](https://railway.app/) or [Supabase](https://supabase.com/)
2. Copy the connection string provided
3. You'll use this in the environment configuration

### Step 3: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# This will install:
# - NestJS core and platform
# - Prisma ORM and client
# - Authentication libraries (JWT, bcrypt, passport)
# - Validation libraries
# - And all other dependencies
```

### Step 4: Install Frontend Dependencies

Open a new terminal window and run:

```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install

# This will install:
# - React and React DOM
# - Redux Toolkit
# - React Router
# - Axios
# - Tailwind CSS
# - And all other dependencies
```

## 🔐 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `/backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Connection
# For local PostgreSQL:
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/orderease?schema=public"
# For cloud PostgreSQL, use the connection string provided by your service

# JWT Secrets (IMPORTANT: Generate strong, random secrets!)
# Generate with: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_this
JWT_REFRESH_EXPIRES_IN=30d

# Application Settings
PORT=3000
NODE_ENV=development

# CORS Configuration
# Update this if your frontend runs on a different port
CORS_ORIGIN=http://localhost:3001
```

**Configuration Notes:**

- **DATABASE_URL**: Replace `your_password_here` with your PostgreSQL password
- **JWT_SECRET**: Use a strong, random string for production (e.g., generate with `openssl rand -base64 32`)
- **PORT**: Backend will run on this port (default: 3000)
- **CORS_ORIGIN**: Frontend URL for CORS configuration

### Frontend Environment Variables

Create a `.env` file in the `/frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Edit the `.env` file:

```env
# API Configuration
# Point to your backend API endpoint
REACT_APP_API_GATEWAY_URL=http://localhost:3000/api
REACT_APP_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development

# Optional: Feature flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_LOGGING=true
```

**Configuration Notes:**

- **REACT_APP_API_URL**: Must match the backend PORT in backend `.env`
- The frontend will run on `http://localhost:3001` by default
- All environment variables must start with `REACT_APP_` to be accessible in React

### 🔒 Local HTTPS Setup (Optional)

For development scenarios requiring HTTPS (OAuth, service workers, secure cookies), OrderEase supports running the frontend on `https://orderease.dev` with a local custom domain.

**Quick Setup:**

```bash
# See detailed instructions in HTTPS_SETUP.md
# Or follow the comprehensive guide in frontend/README.md

# 1. Install mkcert and generate certificates
brew install mkcert && mkcert -install

# 2. Generate SSL certificates
cd frontend && mkdir -p certs && cd certs
mkcert -cert-file orderease.dev.pem -key-file orderease.dev-key.pem orderease.dev localhost 127.0.0.1 ::1

# 3. Update hosts file
echo "127.0.0.1    orderease.dev" | sudo tee -a /etc/hosts

# 4. Update backend CORS (backend/.env)
CORS_ORIGIN=http://localhost:3001,https://orderease.dev:3001

# 5. Start frontend with HTTPS
npm run dev:https
```

**Architecture:**
```
Browser (https://orderease.dev:3001)
   ↓
Frontend Dev Server (HTTPS)
   ↓ proxy (/api)
Backend API (HTTP on localhost:3000)
```

📖 **Full documentation**: 
- **Windows users**: See [WINDOWS_HTTPS_SETUP.md](./WINDOWS_HTTPS_SETUP.md) for step-by-step Windows guide
- **All platforms**: See [HTTPS_SETUP.md](./HTTPS_SETUP.md) for platform-specific instructions
- **Detailed guide**: See [frontend/README.md](./frontend/README.md#-local-https-setup-orderease-dev) for comprehensive documentation

## 🚀 Running the Application

### Initialize the Database

Before running the application for the first time, you need to set up the database:

```bash
# Navigate to backend directory
cd backend

# Generate Prisma Client (creates type-safe database client)
npm run prisma:generate

# Run database migrations (creates tables and schema)
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

**What the seed command creates:**

- **Sample Menu Items**: 12 food items across 5 categories
  - Starters: Spring Rolls, Garlic Bread, Chicken Wings
  - Main Course: Margherita Pizza, Grilled Chicken, Pasta Carbonara, Butter Chicken
  - Desserts: Chocolate Cake, Ice Cream Sundae
  - Drinks: Fresh Juice, Iced Coffee, Milkshake

- **Default Admin Account**:
  - Email: `admin@orderease.com`
  - Password: `admin123`
  - Role: ADMIN

- **Default User Account**:
  - Email: `user@orderease.com`
  - Password: `user123`
  - Role: USER

### Start the Backend Server

```bash
# Make sure you're in the backend directory
cd backend

# Start in development mode (with hot reload)
npm run start:dev

# Alternative: Start in production mode
# npm run start:prod
```

You should see output similar to:
```
[Nest] 12345  - 01/05/2026, 8:25:41 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/05/2026, 8:25:41 PM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 01/05/2026, 8:25:41 PM     LOG [RoutesResolver] AuthController {/api/auth}
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

### Base URL
```
http://localhost:3000/api
```

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Core API Endpoints

#### **Authentication** (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |

**Example Login Request:**
```json
POST /api/auth/login
{
  "email": "user@orderease.com",
  "password": "user123"
}
```

**Example Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx...",
    "email": "user@orderease.com",
    "name": "Test User",
    "role": "USER"
  }
}
```

#### **Public Endpoints** (`/api/public`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/public/menu` | Get all menu items | No |
| GET | `/public/health` | Health check | No |

#### **Cart Management** (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user's cart | Yes (USER) |
| POST | `/cart` | Add item to cart | Yes (USER) |
| PUT | `/cart/:itemId` | Update cart item quantity | Yes (USER) |
| DELETE | `/cart/:itemId` | Remove item from cart | Yes (USER) |
| DELETE | `/cart` | Clear entire cart | Yes (USER) |

#### **Order Management** (`/api/order`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/order/from-cart` | Create order from cart | Yes (USER) |
| POST | `/order` | Create order with items | Yes (USER) |
| GET | `/order` | Get all orders | Yes (ADMIN) |
| GET | `/order/:id` | Get specific order | Yes (USER/ADMIN) |
| PUT | `/order/:id/status` | Update order status | Yes (ADMIN) |

**Order Status Flow:**
```
PENDING → PREPARING → READY → DELIVERED
         ↓
      CANCELLED (at any point)
```

#### **Food/Menu Management** (`/api/food`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/food` | Create food item | Yes (ADMIN) |
| GET | `/food` | Get all food items | Yes (ADMIN) |
| GET | `/food/:id` | Get specific food item | Yes (ADMIN) |
| PUT | `/food/:id` | Update food item | Yes (ADMIN) |
| DELETE | `/food/:id` | Delete food item | Yes (ADMIN) |

#### **Admin Endpoints** (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Get dashboard stats | Yes (ADMIN) |
| GET | `/admin/users` | Get all users | Yes (ADMIN) |
| PUT | `/admin/users/:id/role` | Update user role | Yes (ADMIN) |
| DELETE | `/admin/users/:id` | Delete user | Yes (ADMIN) |

#### **User Endpoints** (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes (USER) |
| PUT | `/user/profile` | Update user profile | Yes (USER) |
| GET | `/user/orders` | Get user's order history | Yes (USER) |

### Typical User Flows

**Customer Flow:**
1. Browse menu: `GET /api/public/menu`
2. Register: `POST /api/auth/signup`
3. Login: `POST /api/auth/login`
4. Add items to cart: `POST /api/cart`
5. View cart: `GET /api/cart`
6. Create order from cart: `POST /api/order/from-cart`
7. View order history: `GET /api/user/orders`

**Admin Flow:**
1. Login: `POST /api/auth/login` (with admin credentials)
2. View dashboard: `GET /api/admin/dashboard`
3. Manage menu: CRUD operations on `/api/food`
4. View orders: `GET /api/order`
5. Update order status: `PUT /api/order/:id/status`
6. Manage users: CRUD operations on `/api/admin/users`

### Complete API Documentation

For detailed API documentation including request/response schemas, validation rules, and error codes, see:
- [`/backend/API.md`](./backend/API.md) - Complete API reference
- [`/backend/ARCHITECTURE.md`](./backend/ARCHITECTURE.md) - Architecture details

## 📁 Project Structure

```
OrderEase/
├── backend/                           # NestJS Backend (PostgreSQL + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema definition
│   │   └── seed.ts                    # Database seeding script
│   ├── src/
│   │   ├── admin/                     # Admin module
│   │   │   ├── admin.controller.ts   # Admin endpoints
│   │   │   ├── admin.service.ts      # Admin business logic
│   │   │   └── dto/                   # Data transfer objects
│   │   ├── auth/                      # Authentication module
│   │   │   ├── auth.controller.ts    # Auth endpoints (login, signup, refresh)
│   │   │   ├── auth.service.ts       # Auth business logic
│   │   │   ├── decorators/           # Custom decorators (@Auth, @CurrentUser, etc.)
│   │   │   ├── dto/                   # Auth DTOs (LoginDto, SignupDto, etc.)
│   │   │   ├── guards/                # Auth guards (JWT, Roles)
│   │   │   └── strategies/            # Passport strategies (JWT strategy)
│   │   ├── cart/                      # Shopping cart module
│   │   │   ├── cart.controller.ts    # Cart endpoints
│   │   │   ├── cart.service.ts       # Cart business logic
│   │   │   └── cart.dto.ts            # Cart DTOs
│   │   ├── food/                      # Food/Menu module
│   │   │   ├── food.controller.ts    # Food CRUD endpoints
│   │   │   ├── food.service.ts       # Food business logic
│   │   │   └── food.dto.ts            # Food DTOs
│   │   ├── order/                     # Order processing module
│   │   │   ├── order.controller.ts   # Order endpoints
│   │   │   ├── order.service.ts      # Order business logic
│   │   │   └── order.dto.ts           # Order DTOs
│   │   ├── user/                      # User management module
│   │   │   ├── user.controller.ts    # User endpoints
│   │   │   ├── user.service.ts       # User business logic
│   │   │   └── dto/                   # User DTOs
│   │   ├── public/                    # Public endpoints (no auth)
│   │   │   ├── public.controller.ts  # Public menu, health check
│   │   │   └── public.service.ts     # Public business logic
│   │   ├── gateway/                   # API Gateway layer
│   │   │   ├── interceptors/         # Logging, transform interceptors
│   │   │   └── filters/               # Exception filters
│   │   ├── database/                  # Database module
│   │   │   └── prisma.service.ts     # Prisma service configuration
│   │   ├── config/                    # Configuration module
│   │   ├── constants/                 # Application constants
│   │   ├── utils/                     # Utility functions
│   │   ├── app.module.ts             # Root application module
│   │   └── main.ts                    # Application entry point
│   ├── test/                          # E2E tests
│   ├── .env.example                   # Environment variables template
│   ├── nest-cli.json                  # NestJS CLI configuration
│   ├── package.json                   # Backend dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── API.md                         # API documentation
│   ├── ARCHITECTURE.md                # Architecture documentation
│   └── README.md                      # Backend README
│
├── frontend/                          # React Frontend
│   ├── public/                        # Static assets
│   │   ├── index.html                # HTML template
│   │   └── assets/                    # Images, icons
│   ├── src/
│   │   ├── api/                       # API configuration
│   │   │   └── axios.js              # Axios instance setup
│   │   ├── components/                # Reusable components
│   │   │   ├── admin/                # Admin components
│   │   │   │   └── AdminNavbar.jsx  # Admin navigation
│   │   │   ├── customer/             # Customer components
│   │   │   │   └── Navbar.jsx       # Customer navigation
│   │   │   └── ui/                   # Shared UI components
│   │   ├── pages/                     # Page components (routes)
│   │   │   ├── admin/                # Admin pages
│   │   │   │   ├── DashboardPage.jsx        # Dashboard with stats
│   │   │   │   ├── LoginPage.jsx            # Admin login
│   │   │   │   ├── MenuManagementPage.jsx   # Menu CRUD
│   │   │   │   └── OrdersManagementPage.jsx # Order management
│   │   │   └── customer/             # Customer pages
│   │   │       ├── MenuPage.jsx             # Browse menu
│   │   │       ├── CartPage.jsx             # Shopping cart
│   │   │       ├── CheckoutPage.jsx         # Checkout flow
│   │   │       └── OrderConfirmationPage.jsx # Order confirmation
│   │   ├── redux/                     # Redux state management
│   │   │   ├── slices/               # Redux slices
│   │   │   │   ├── authSlice.js     # Auth state
│   │   │   │   ├── cartSlice.js     # Cart state
│   │   │   │   └── orderSlice.js    # Order state
│   │   │   └── store.js              # Redux store configuration
│   │   ├── services/                  # API service layer
│   │   │   └── api/                  # API modules
│   │   │       ├── auth.api.js      # Auth API calls
│   │   │       ├── menu.api.js      # Menu API calls
│   │   │       ├── orders.api.js    # Orders API calls
│   │   │       ├── httpClient.js    # HTTP client with interceptors
│   │   │       └── index.js         # Export all APIs
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── utils/                     # Utility functions
│   │   │   ├── format.js            # Formatting helpers
│   │   │   └── validation.js        # Validation helpers
│   │   ├── config/                    # Frontend configuration
│   │   ├── App.js                     # Main App component
│   │   ├── App.test.js               # App tests
│   │   ├── index.js                   # React entry point
│   │   └── index.css                  # Global styles (Tailwind)
│   ├── .env.example                   # Environment variables template
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── README.md                      # Frontend README
│
├── .gitignore                         # Git ignore rules
├── package.json                       # Root package.json (scripts)
├── README.md                          # This file
├── CONTRIBUTING.md                    # Contribution guidelines
├── LICENSE                            # MIT License
└── QUICK_START.md                     # Quick start guide
```

### Key Directories Explained

- **`backend/src/`**: All backend source code organized by feature modules
- **`backend/prisma/`**: Database schema and migration files
- **`frontend/src/pages/`**: Top-level route components
- **`frontend/src/components/`**: Reusable UI components
- **`frontend/src/redux/`**: Global state management
- **`frontend/src/services/`**: API service layer for backend communication

## 🎨 Database Schema (NestJS Backend)

### User
```typescript
{
  id: String (CUID),
  email: String (unique),
  password: String (hashed with bcrypt),
  name: String,
  role: ADMIN | USER,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Food
```typescript
{
  id: String (CUID),
  name: String,
  description: String,
  price: Float,
  category: String,
  image: String (URL),
  isAvailable: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Cart
```typescript
{
  id: String (CUID),
  userId: String (unique),
  cartItems: CartItem[],
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### CartItem
```typescript
{
  id: String (CUID),
  cartId: String,
  foodId: String,
  quantity: Integer,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Order
```typescript
{
  id: String (CUID),
  userId: String,
  totalPrice: Float,
  status: PENDING | PREPARING | READY | DELIVERED | CANCELLED,
  orderItems: OrderItem[],
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### OrderItem
```typescript
{
  id: String (CUID),
  orderId: String,
  foodId: String,
  quantity: Integer,
  price: Float (price at time of order)
}
```

## 🔒 Security Features (NestJS Backend)

### Authentication & Authorization
- ✅ JWT-based authentication with access and refresh tokens
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Role-based access control (RBAC) - ADMIN and USER roles
- ✅ Protected routes with guards
- ✅ Secure token generation and validation

### Input Validation
- ✅ Global validation pipe with class-validator
- ✅ DTO-based request validation
- ✅ Whitelist mode (strips unknown properties)
- ✅ Type transformation and coercion
- ✅ Custom validation rules

### API Gateway Protection
- ✅ Request/response logging with sensitive data sanitization
- ✅ Centralized error handling
- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ CORS configuration
- ✅ Structured error responses with codes

### Database Security
- ✅ Parameterized queries via Prisma (no SQL injection)
- ✅ Database transactions for data consistency
- ✅ Cascade deletes for referential integrity
- ✅ Unique constraints on critical fields
- ✅ Foreign key relationships

### Code Quality
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Proper error handling throughout
- ✅ No security vulnerabilities (CodeQL verified)

## 🚀 Deployment

### NestJS Backend (Recommended)

#### Option 1: Railway/Render
1. Create PostgreSQL database
2. Push code to GitHub
3. Connect repository to hosting platform
4. Set environment variables
5. Deploy

#### Option 2: Docker
```bash
# Build image
docker build -t orderease-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your_secret" \
  orderease-backend
```

### Frontend (Vercel/Netlify)
1. Build the app: `npm run build`
2. Deploy the build folder
3. Set environment variable for API URL

### Database
- **PostgreSQL**: Use Railway, Supabase, or managed PostgreSQL

## 🔧 Troubleshooting

### Backend Issues

#### Problem: Cannot connect to PostgreSQL

**Symptoms:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solutions:**

1. **Check if PostgreSQL is running:**
   ```bash
   # On Windows
   # Check Services for PostgreSQL
   
   # On macOS
   brew services list
   brew services start postgresql
   
   # On Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Verify DATABASE_URL in `.env`:**
   ```env
   # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   DATABASE_URL="postgresql://postgres:password@localhost:5432/orderease"
   ```

3. **Test connection manually:**
   ```bash
   psql -U postgres -d orderease
   ```

#### Problem: Port 3000 already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Change the port in backend `.env`:**
   ```env
   PORT=3001
   ```

2. **Update frontend `.env` to match:**
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. **Or kill the process using port 3000:**
   ```bash
   # On macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

#### Problem: Prisma migration fails

**Symptoms:**
```
Error: Migration failed: ...
```

**Solutions:**

1. **Reset the database (WARNING: Deletes all data):**
   ```bash
   cd backend
   npx prisma migrate reset
   npm run prisma:seed
   ```

2. **Generate Prisma Client again:**
   ```bash
   npm run prisma:generate
   ```

3. **Check DATABASE_URL is correct in `.env`**

#### Problem: JWT token errors

**Symptoms:**
```
401 Unauthorized
"message": "Invalid token"
```

**Solutions:**

1. **Check JWT_SECRET is set in backend `.env`**
2. **Clear browser local storage and login again**
3. **Ensure token is not expired (default: 7 days)**

### Frontend Issues

#### Problem: Cannot connect to API

**Symptoms:**
```
Error: Network Error
or
CORS error in browser console
```

**Solutions:**

1. **Verify backend is running on correct port:**
   ```bash
   # Check backend console for "Server is running on: http://localhost:3000"
   ```

2. **Check frontend `.env` has correct API URL:**
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   ```

3. **Verify CORS_ORIGIN in backend `.env` matches frontend URL:**
   ```env
   CORS_ORIGIN=http://localhost:3001
   ```

4. **Restart both servers after changing `.env` files**

#### Problem: npm install fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use legacy peer deps (if needed):**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Check Node.js version:**
   ```bash
   node --version  # Should be v18.x or higher
   ```

#### Problem: Tailwind styles not working

**Symptoms:**
- UI looks unstyled
- Tailwind classes not applying

**Solutions:**

1. **Ensure Tailwind is configured in `tailwind.config.js`**
2. **Check `index.css` imports Tailwind:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. **Restart the frontend development server**

### Database Issues

#### Problem: Database doesn't have sample data

**Solutions:**

```bash
cd backend
npm run prisma:seed
```

#### Problem: Can't access Prisma Studio

**Solutions:**

```bash
cd backend
npm run prisma:studio
# Opens at http://localhost:5555
```

### Common Setup Mistakes

1. **Forgot to create `.env` files**
   - Copy from `.env.example` in both backend and frontend

2. **Wrong API URL in frontend `.env`**
   - Must match backend PORT

3. **Forgot to run database migrations**
   - Run `npm run prisma:migrate` in backend

4. **Forgot to seed database**
   - Run `npm run prisma:seed` in backend

5. **Using wrong credentials to login**
   - Admin: `admin@orderease.com` / `admin123`
   - User: `user@orderease.com` / `user123`

### Getting Help

If you're still experiencing issues:

1. **Check the console logs** (both backend terminal and browser console)
2. **Review the error messages** carefully
3. **Ensure all prerequisites are installed**
4. **Try the complete setup from scratch**
5. **Open an issue on GitHub** with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

## 📝 Future Enhancements

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Email notifications
- [ ] SMS order updates
- [ ] Customer order history
- [ ] Reviews and ratings
- [ ] Multiple restaurant support
- [ ] Analytics and reporting

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Before contributing:**
1. Read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
2. Check existing issues and pull requests
3. Follow the code style and commit conventions
4. Test your changes thoroughly

## 📄 License

This project is open source and available under the [MIT License](./LICENSE).

## 👨‍💻 About

This project is part of TechSign's portfolio, demonstrating modern full-stack development skills:
- RESTful API design and implementation
- Database modeling and optimization
- State management with Redux
- Authentication & authorization (JWT + RBAC)
- Responsive UI/UX design
- Modern TypeScript and React patterns
- Production-ready architecture

## 📧 Support

For questions, issues, or collaboration opportunities:
- Open an issue on [GitHub](https://github.com/TECH-SIGN/OrderEase/issues)
- Check the [Troubleshooting](#-troubleshooting) section
- Review the [QUICK_START.md](./QUICK_START.md) guide

---

⭐ **If you found this project helpful, please consider giving it a star!**

Made with ❤️ by TechSign
