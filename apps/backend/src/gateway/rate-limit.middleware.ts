import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Simple rate limiting middleware
 * In production, use @nestjs/throttler or Redis-based rate limiting
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // Max requests per window

  use(req: Request, res: Response, next: NextFunction) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get request timestamps for this IP
    let timestamps = this.requests.get(key) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    if (timestamps.length >= this.maxRequests) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add current request timestamp
    timestamps.push(now);
    this.requests.set(key, timestamps);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance
      this.cleanup();
    }

    next();
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => timestamp > windowStart,
      );
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }
}
