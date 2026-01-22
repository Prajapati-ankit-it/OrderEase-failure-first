import { SetMetadata } from '@nestjs/common';
import { Role } from '@orderease/shared-contracts';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route
 * @param roles - Array of roles that are allowed
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
