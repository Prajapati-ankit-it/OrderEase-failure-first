/**
 * User Roles Constants Tests
 * Tests user role constants and helper functions
 */

import { UserRole, isAdmin, isUser, hasValidRole } from './userRoles';

describe('User Roles Constants', () => {
  describe('UserRole enum', () => {
    it('should have correct role values', () => {
      expect(UserRole.ADMIN).toBe('ADMIN');
      expect(UserRole.USER).toBe('USER');
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const adminUser = { role: UserRole.ADMIN };
      expect(isAdmin(adminUser)).toBe(true);
    });

    it('should return false for regular user', () => {
      const regularUser = { role: UserRole.USER };
      expect(isAdmin(regularUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isAdmin(null)).toBe(false);
    });

    it('should return false for user without role', () => {
      const userWithoutRole = { name: 'Test' };
      expect(isAdmin(userWithoutRole)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('should return true for regular user', () => {
      const regularUser = { role: UserRole.USER };
      expect(isUser(regularUser)).toBe(true);
    });

    it('should return false for admin user', () => {
      const adminUser = { role: UserRole.ADMIN };
      expect(isUser(adminUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isUser(null)).toBe(false);
    });

    it('should return false for user without role', () => {
      const userWithoutRole = { name: 'Test' };
      expect(isUser(userWithoutRole)).toBe(false);
    });
  });

  describe('hasValidRole', () => {
    it('should return true for user with ADMIN role', () => {
      const adminUser = { role: UserRole.ADMIN };
      expect(hasValidRole(adminUser)).toBe(true);
    });

    it('should return true for user with USER role', () => {
      const regularUser = { role: UserRole.USER };
      expect(hasValidRole(regularUser)).toBe(true);
    });

    it('should return false for user with invalid role', () => {
      const invalidUser = { role: 'INVALID_ROLE' };
      expect(hasValidRole(invalidUser)).toBe(false);
    });

    it('should return false for user without role', () => {
      const userWithoutRole = { name: 'Test' };
      expect(hasValidRole(userWithoutRole)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasValidRole(null)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(hasValidRole(undefined)).toBe(false);
    });
  });
});
