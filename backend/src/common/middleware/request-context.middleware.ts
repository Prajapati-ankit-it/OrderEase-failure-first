import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Extended Request interface with context properties
 */
export interface RequestWithContext extends Request {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

/**
 * Middleware to add request context (correlation ID) to each request
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: RequestWithContext, res: Response, next: NextFunction) {
    // Generate or use existing request ID from header
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    
    // Attach request ID to request object
    req.requestId = requestId;
    
    // Also set it as response header for tracing
    res.setHeader('x-request-id', requestId);
    
    next();
  }
}
