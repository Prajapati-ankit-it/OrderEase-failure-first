/**
 * Auth module DTOs
 * Mirror backend/src/auth/dto/*.ts
 */

import { Role } from './common.types';
import { SafeUser } from './user.types';

/**
 * LoginDto from backend/src/auth/dto/login.dto.ts
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * SignUpDto from backend/src/auth/dto/signup.dto.ts
 */
export interface SignUpDto {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}

/**
 * Auth response data structure
 * Backend returns user.toSafeUser() which is typed as SafeUser
 */
export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}
