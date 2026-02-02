# Troubleshooting Guide - API Gateway

## Common Issues and Solutions

### 1. CORS Errors

**Symptoms:**
- Browser console shows "CORS error"
- Network requests fail with status code showing CORS-related errors
- Errors like "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Cause:**
- API Gateway CORS configuration doesn't include the frontend origin
- Using `CORS_ORIGIN=*` with `credentials: true` (not allowed by browsers)

**Solution:**

1. Create/update `.env` file in `apps/api-gateway/`:
   ```bash
   # For local development
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001
   
   # For production
   CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
   ```

2. Restart the API Gateway:
   ```bash
   cd apps/api-gateway
   pnpm dev
   ```

**Important Notes:**
- You cannot use `CORS_ORIGIN=*` when `credentials: true` is enabled
- Multiple origins must be comma-separated
- Include protocol (http:// or https://)
- No trailing slashes

---

### 2. Rate Limiting Issues

**Symptoms:**
- Getting 429 (Too Many Requests) errors
- Requests blocked after a certain number of calls

**Cause:**
- Rate limit exceeded for your IP address

**Solution:**

Adjust rate limits in `.env`:
```bash
# Increase limits for development
RATE_LIMIT_TTL=60000    # 60 seconds
RATE_LIMIT_MAX=1000     # 1000 requests per IP

# Or disable by setting very high limits
RATE_LIMIT_MAX=999999
```

---

### 3. Gateway Not Starting

**Symptoms:**
- Gateway fails to start
- Error: "Cannot find module" or "Port already in use"

**Solutions:**

**If dependencies are missing:**
```bash
# From repository root
pnpm install

# Or from api-gateway directory
cd apps/api-gateway
pnpm install
```

**If port is in use:**
```bash
# Find process using port 4000
lsof -ti:4000

# Kill the process
kill <PID>

# Or change port in .env
PORT=4001
```

---

### 4. Backend Connection Issues

**Symptoms:**
- Gateway starts but requests fail
- Error: "PROXY_ERROR" or connection refused

**Cause:**
- Backend service not running (port 3001)
- Wrong BACKEND_URL configured

**Solution:**

1. Start the backend service:
   ```bash
   cd apps/backend
   pnpm dev
   ```

2. Verify BACKEND_URL in `apps/api-gateway/.env`:
   ```bash
   # Main backend service
   BACKEND_URL=http://localhost:3001
   
   # Order service (if separate)
   ORDER_SERVICE_URL=http://localhost:3002
   ```

**Note:** The main backend typically runs on port 3001. The order service (if separated) runs on port 3002.

---

### 5. Environment Variables Not Working

**Symptoms:**
- Default values are being used instead of .env values
- Configuration changes don't take effect

**Solutions:**

1. Make sure `.env` file exists in `apps/api-gateway/`
2. Copy from example:
   ```bash
   cd apps/api-gateway
   cp .env.example .env
   ```

3. Restart the gateway after changing .env:
   ```bash
   pnpm dev
   ```

---

## Quick Checklist

Before reporting an issue, verify:

- [ ] `.env` file exists in `apps/api-gateway/`
- [ ] CORS_ORIGIN includes your frontend URL
- [ ] Backend service is running on configured port
- [ ] Dependencies are installed (`pnpm install`)
- [ ] No other process is using port 4000
- [ ] Environment variables are set correctly

---

## Getting Help

1. Check the logs when starting the gateway
2. Look for error messages in browser console (F12)
3. Verify network requests in browser DevTools
4. Check that rate limit headers are present in responses

---

## Configuration Templates

### Development Setup
```bash
# apps/api-gateway/.env
PORT=4000
BACKEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=1000
```

### Production Setup
```bash
# apps/api-gateway/.env
PORT=4000
BACKEND_URL=http://backend:3001
CORS_ORIGIN=https://app.yourdomain.com,https://admin.yourdomain.com
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
```

### Testing Setup (No Rate Limits)
```bash
# apps/api-gateway/.env
PORT=4000
BACKEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=999999
```
