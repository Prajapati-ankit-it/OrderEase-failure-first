import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract user ID from request headers
 * API Gateway will set 'x-user-id' header after authentication
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // Get userId from header set by API Gateway
    const userId = request.headers['x-user-id'];
    
    if (!userId) {
      throw new Error('User ID not found in request headers. Ensure API Gateway is setting x-user-id header.');
    }
    
    return userId;
  },
);
