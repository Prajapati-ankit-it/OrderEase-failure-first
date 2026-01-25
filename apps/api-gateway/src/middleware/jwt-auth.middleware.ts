import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No authorization token provided');
      }

      const token = authHeader.substring(7).trim(); // Remove 'Bearer ' prefix and trim
      
      if (!token) {
        throw new UnauthorizedException('No authorization token provided');
      }
      
      // Verify and decode JWT token (using configured JwtService)
      const payload = this.jwtService.verify<JwtPayload>(token);

      // Set x-user-id header for downstream services
      req.headers['x-user-id'] = payload.sub;
      
      next();
    } catch (error) {
      // Return generic error message for security while logging specific error for debugging
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
