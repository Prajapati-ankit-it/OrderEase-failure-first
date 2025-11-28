import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

/**
 * Custom decorator to get the current user from the request
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // If a specific property is requested, return just that property
    if (data && user) {
      return user[data as keyof typeof user];
    }

    return user;
  },
);
