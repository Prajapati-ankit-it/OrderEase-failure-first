# IP-Based Rate Limiting - Deployment Guide

## Overview

The OrderEase API Gateway now includes **IP-based rate limiting** as a transparent layer that protects backend services from abuse without requiring any backend code changes.

## Features

✅ **IP-based tracking** - Rate limits based on client IP address  
✅ **Proxy-aware** - Correctly handles X-Forwarded-For and X-Real-IP headers  
✅ **Configurable** - Easy to adjust limits via environment variables  
✅ **Transparent** - Zero backend modifications required  
✅ **Standard compliance** - Returns proper HTTP 429 status with retry headers  
✅ **Production-ready** - Built on NestJS Throttler with in-memory storage  

## Quick Start

### 1. Configuration

Create or update `.env` file in `apps/api-gateway/`:

```bash
# Rate Limiting Configuration
RATE_LIMIT_TTL=60000      # Time window: 60 seconds
RATE_LIMIT_MAX=100        # Max requests per IP: 100
```

### 2. Start the Gateway

```bash
# Development
cd apps/api-gateway
pnpm install
pnpm dev

# Production
pnpm build
pnpm start:prod
```

### 3. Verify Rate Limiting

```bash
# Run the test script
./test-rate-limit.sh

# Or test manually
for i in {1..10}; do
  curl -i http://localhost:4000/api/public/health
  sleep 1
done
```

## Configuration Options

### Preset Configurations

#### Strict (Login/Signup endpoints)
```bash
RATE_LIMIT_TTL=30000      # 30 seconds
RATE_LIMIT_MAX=10         # 10 requests per IP
```

#### Moderate (General API usage)
```bash
RATE_LIMIT_TTL=60000      # 60 seconds
RATE_LIMIT_MAX=50         # 50 requests per IP
```

#### Relaxed (Public endpoints)
```bash
RATE_LIMIT_TTL=120000     # 2 minutes
RATE_LIMIT_MAX=200        # 200 requests per IP
```

#### Default (Balanced)
```bash
RATE_LIMIT_TTL=60000      # 60 seconds
RATE_LIMIT_MAX=100        # 100 requests per IP
```

### Custom Configuration

You can set any values that fit your needs:

```bash
# 500 requests per 5 minutes
RATE_LIMIT_TTL=300000
RATE_LIMIT_MAX=500

# 20 requests per 10 seconds (very strict)
RATE_LIMIT_TTL=10000
RATE_LIMIT_MAX=20
```

## Response Format

### Successful Request (Within Limit)

**HTTP Status:** 200 (or backend response status)

**Headers:**
```
X-RateLimit-Limit-short: 100
X-RateLimit-Remaining-short: 95
X-RateLimit-Reset-short: 45
```

### Rate Limited Request

**HTTP Status:** 429 Too Many Requests

**Headers:**
```
Retry-After-short: 60
```

**Body:**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## IP Detection Logic

The gateway uses the following priority for IP detection:

1. **X-Forwarded-For** header (first IP in the list)
2. **X-Real-IP** header
3. **req.ip** (Express request IP)
4. **socket.remoteAddress** (Direct connection IP)
5. **"unknown"** (fallback if no IP can be determined)

This ensures proper functionality behind:
- Load balancers (AWS ALB, ELB, NGINX, etc.)
- Reverse proxies (NGINX, Apache, etc.)
- CDNs (CloudFlare, Akamai, etc.)

## Docker Deployment

### Docker Compose

Add rate limiting configuration to `docker-compose.yml`:

```yaml
api-gateway:
  build:
    context: ./apps/api-gateway
    dockerfile: Dockerfile
  environment:
    - RATE_LIMIT_TTL=60000
    - RATE_LIMIT_MAX=100
  ports:
    - "4000:4000"
```

### Kubernetes

Create a ConfigMap for rate limiting:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-gateway-config
data:
  RATE_LIMIT_TTL: "60000"
  RATE_LIMIT_MAX: "100"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  template:
    spec:
      containers:
      - name: api-gateway
        envFrom:
        - configMapRef:
            name: api-gateway-config
```

## Monitoring

### Log Messages

The gateway logs rate limiting configuration on startup:

```
🚀 API Gateway running on: http://localhost:4000
📡 Routing to:
   - /api/auth → Backend Service
   - /api/users → Backend Service
   ...
🚦 IP-based Rate Limiting:
   - Max requests: 100 per 60s
   - Tracked by: Client IP address
```

### Metrics to Monitor

1. **429 Response Rate** - Track percentage of rate-limited requests
2. **Requests per IP** - Monitor distribution of requests across IPs
3. **Rate Limit Resets** - Track how often limits are being reset
4. **False Positives** - Monitor for legitimate users being rate-limited

## Scaling Considerations

### Current Implementation
- **Storage:** In-memory (per instance)
- **Scaling:** Each gateway instance maintains its own rate limit counters
- **Impact:** Rate limits are per-instance, not global

### For Production at Scale

Consider upgrading to distributed rate limiting using Redis:

```typescript
// In app.module.ts
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    throttlers: [{
      ttl: config.get('RATE_LIMIT_TTL'),
      limit: config.get('RATE_LIMIT_MAX'),
    }],
    storage: new ThrottlerStorageRedisService({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    }),
  }),
}),
```

## Testing

### Unit Tests

```bash
cd apps/api-gateway
pnpm test
```

### Integration Tests

```bash
# Start the gateway
pnpm dev

# Run the test script
./test-rate-limit.sh
```

### Manual Testing

```bash
# Test with curl
for i in {1..10}; do
  echo "Request $i:"
  curl -i http://localhost:4000/api/public/health
  echo ""
done

# Test with specific IP (using X-Forwarded-For)
curl -H "X-Forwarded-For: 192.168.1.100" http://localhost:4000/api/public/health
```

## Troubleshooting

### Issue: All requests getting 429 immediately

**Cause:** Rate limit is too low or time window is too short

**Solution:** Increase `RATE_LIMIT_MAX` or `RATE_LIMIT_TTL`

### Issue: Rate limiting not working

**Cause:** Environment variables not loaded

**Solution:** 
1. Verify `.env` file exists in `apps/api-gateway/`
2. Check environment variables are being read: `echo $RATE_LIMIT_TTL`
3. Restart the gateway

### Issue: Legitimate users being rate limited

**Cause:** Multiple users behind same IP (NAT, corporate proxy)

**Solution:**
1. Increase rate limits
2. Consider per-user rate limiting (requires authentication)
3. Whitelist known IP ranges

### Issue: Rate limits not resetting

**Cause:** System clock issues or expired process

**Solution:**
1. Verify system time is correct
2. Restart the gateway
3. Check for memory leaks

## Security Considerations

### IP Spoofing Protection

The gateway trusts proxy headers (X-Forwarded-For). Ensure:
1. Gateway is behind a trusted proxy/load balancer
2. Proxy strips client-supplied X-Forwarded-For headers
3. Proxy adds its own X-Forwarded-For with real client IP

### DDoS Protection

Rate limiting provides basic DDoS protection but should be combined with:
1. Network-level rate limiting (firewall, CDN)
2. Connection limits
3. Request size limits
4. Geographic filtering

### Privacy

IP addresses are used only for rate limiting and are:
- Not logged by default
- Not stored persistently
- Cleared after rate limit window expires

## Migration & Rollback

### Enabling Rate Limiting

1. Deploy updated API Gateway
2. Configure rate limits via environment variables
3. Monitor 429 response rates
4. Adjust limits based on traffic patterns

### Disabling Rate Limiting

Set very high limits to effectively disable:

```bash
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=999999
```

Or rollback to previous gateway version without rate limiting.

### Zero-Downtime Deployment

1. Deploy new gateway instances with rate limiting
2. Update load balancer to route to new instances
3. Monitor for issues
4. Decommission old instances

## Support

For issues or questions:
1. Check logs: `docker logs <container-id>`
2. Review configuration: `.env` file
3. Run test script: `./test-rate-limit.sh`
4. Open an issue on GitHub

## License

MIT License - Same as OrderEase project
