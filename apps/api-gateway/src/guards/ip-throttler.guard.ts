import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/**
 * Custom throttler guard that uses IP address as the rate limiting key.
 * Supports both direct connections and requests through proxies (using X-Forwarded-For).
 */
@Injectable()
export class IpThrottlerGuard extends ThrottlerGuard {
  /**
   * Extract the client IP address from the request.
   * Checks X-Forwarded-For header first (for proxy/load balancer scenarios),
   * then falls back to X-Real-IP and finally to the direct connection IP.
   */
  protected async getTracker(req: Request): Promise<string> {
    // Check X-Forwarded-For header (common with proxies, load balancers, and CDNs)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
      // We want the first one (the original client IP)
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      const clientIp = ips.split(',')[0].trim();
      return clientIp;
    }

    // Check X-Real-IP header (alternative header used by some proxies)
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fall back to the socket's remote address
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
