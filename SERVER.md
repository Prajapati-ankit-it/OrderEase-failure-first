# OrderEase - Global Server Launcher

This file allows you to run all OrderEase services from the root folder with a single command.

## Quick Start

```bash
# Install dependencies first
pnpm install

# Run all services
npm start

# Or run specific services
npm run start:api-gateway
npm run start:backend
npm run start:frontend
```

## Usage

### Run All Services

```bash
node server.js
# or
npm start
```

This will start:
1. API Gateway (port 4000) - with IP-based rate limiting
2. Backend (port 3001) - main business logic
3. Frontend (port 3000) - React application

### Run Individual Services

```bash
# API Gateway only
node server.js api-gateway
# or
npm run start:api-gateway

# Backend only
node server.js backend
# or
npm run start:backend

# Frontend only
node server.js frontend
# or
npm run start:frontend
```

## Service Architecture

```
┌─────────────────┐
│   Frontend      │  Port 3000
│   (React)       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  API Gateway    │  Port 4000
│  - Rate Limit   │
│  - Proxy        │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Backend       │  Port 3001
│  - Auth         │
│  - Business     │
│  - Database     │
└─────────────────┘
```

## Features

- **Colored Output**: Each service has its own color for easy identification
- **Graceful Shutdown**: Ctrl+C properly shuts down all services
- **Staggered Startup**: Services start in the correct order (Gateway → Backend → Frontend)
- **Error Handling**: Displays error messages when services fail

## Environment Variables

Each service uses its own `.env` file:

- `apps/api-gateway/.env` - API Gateway configuration
- `apps/backend/.env` - Backend configuration
- `apps/frontend/.env` - Frontend configuration

## Development vs Production

### Development Mode

```bash
# Uses pnpm dev (watch mode with hot reload)
node server.js
```

### Production Mode

```bash
# Build first
pnpm build

# Then run production builds
cd apps/api-gateway && pnpm start:prod &
cd apps/backend && pnpm start:prod &
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using the port
lsof -ti:4000  # API Gateway
lsof -ti:3001  # Backend
lsof -ti:3000  # Frontend

# Kill the process
kill <PID>
```

### Service Won't Start

1. Make sure dependencies are installed:
   ```bash
   pnpm install
   ```

2. Check that environment files exist:
   ```bash
   ls apps/*/. env
   ```

3. Build the services:
   ```bash
   pnpm build
   ```

### Services Start But Don't Work

1. Check logs for each service
2. Verify database is running (for backend)
3. Check network connectivity between services
4. Verify environment variables are set correctly

## Available Scripts

From the root folder:

```bash
# Start services
npm start                    # All services
npm run start:all           # All services (explicit)
npm run start:api-gateway   # API Gateway only
npm run start:backend       # Backend only
npm run start:frontend      # Frontend only

# Development (with watch mode)
pnpm dev                    # All services in parallel
pnpm dev:api-gateway        # API Gateway only
pnpm dev:backend            # Backend only

# Build
pnpm build                  # Build all services

# Test
pnpm test                   # Run all tests

# Lint
pnpm lint                   # Lint all services

# Clean
pnpm clean                  # Remove dist and node_modules
```

## Service Configuration

### API Gateway (Port 4000)

**Purpose**: IP-based rate limiting and request forwarding

**Environment Variables**:
- `RATE_LIMIT_TTL` - Time window in milliseconds (default: 60000)
- `RATE_LIMIT_MAX` - Max requests per IP (default: 100)
- `BACKEND_URL` - Backend service URL (default: http://localhost:3001)

**Responsibilities**:
- Apply IP-based rate limiting
- Forward requests to backend
- Return 429 when rate limit exceeded

### Backend (Port 3001)

**Purpose**: Main business logic and data processing

**Responsibilities**:
- User authentication and authorization
- Business logic (orders, food, cart, etc.)
- Database operations
- Payment processing

### Frontend (Port 3000)

**Purpose**: User interface

**Responsibilities**:
- React-based UI
- User interactions
- API calls to gateway/backend

## Architecture Benefits

### Separation of Concerns

- **Gateway**: Only handles rate limiting
- **Backend**: Only handles business logic
- **Frontend**: Only handles UI

### Independent Scaling

Each service can be scaled independently:
- Scale gateway for high traffic
- Scale backend for processing
- Scale frontend for static assets

### Easy Maintenance

- Each service has its own codebase
- Changes in one service don't affect others
- Can update/replace services independently

## Production Deployment

For production, consider using:

1. **Docker Compose** - Container orchestration
2. **Kubernetes** - Container orchestration at scale
3. **PM2** - Process manager for Node.js
4. **Systemd** - System service management

Example with PM2:

```bash
# Install PM2
npm install -g pm2

# Start all services
pm2 start server.js --name orderease

# Monitor
pm2 monit

# Stop
pm2 stop orderease
```

## License

MIT License - Same as OrderEase project
