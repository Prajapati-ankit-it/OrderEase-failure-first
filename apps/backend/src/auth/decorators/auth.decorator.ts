import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '@orderease/shared-contracts';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Combined auth decorator that applies JWT authentication and optional role-based access
 * @param roles - Optional array of roles that are allowed to access the route
 */
export function Auth(...roles: Role[]) {
  if (roles.length === 0) {
    // Just authentication, no specific role required
    return applyDecorators(UseGuards(JwtAuthGuard));
  }
  // Authentication + role check
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
}
