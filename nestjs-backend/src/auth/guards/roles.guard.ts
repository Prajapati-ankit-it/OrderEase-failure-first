import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role, MESSAGES } from '../../constants';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException(MESSAGES.AUTH.FORBIDDEN);
    }

    const hasRole = requiredRoles.some((role) => user.role === role.toString());

    if (!hasRole) {
      throw new ForbiddenException(MESSAGES.AUTH.FORBIDDEN);
    }

    return true;
  }
}
