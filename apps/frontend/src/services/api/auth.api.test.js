/**
 * Auth API Integration Tests
 * Tests authentication flow integration with backend
 */

import authApi from './auth.api';
import httpClient, { TokenManager } from './httpClient';

// Mock httpClient
jest.mock('./httpClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
  TokenManager: {
    setToken: jest.fn(),
    setRefreshToken: jest.fn(),
    getToken: jest.fn(),
    getRefreshToken: jest.fn(),
    clearAll: jest.fn(),
  },
}));

describe('Auth API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should unwrap backend response', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: '123',
              email: 'admin@test.com',
              role: 'admin',
              name: 'Admin User',
            },
            accessToken: 'access-token-123',
            refreshToken: 'refresh-token-123',
          },
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await authApi.login({
        email: 'admin@test.com',
        password: 'password',
      });

      expect(result).toEqual({
        user: {
          id: '123',
          email: 'admin@test.com',
          role: 'admin',
          name: 'Admin User',
        },
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      });
      // Note: Token storage is now handled by httpClient interceptor
    });

    it('should handle login error correctly', async () => {
      const mockError = {
        message: 'Invalid credentials',
        type: 'UNAUTHORIZED',
      };

      httpClient.post.mockRejectedValue(mockError);

      await expect(
        authApi.login({
          email: 'wrong@test.com',
          password: 'wrong',
        })
      ).rejects.toEqual(mockError);
    });
  });

  describe('register', () => {
    it('should unwrap backend response', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
          data: {
            user: {
              id: '456',
              email: 'newuser@test.com',
              role: 'user',
              name: 'New User',
            },
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await authApi.register({
        email: 'newuser@test.com',
        password: 'password',
        name: 'New User',
      });

      expect(result).toEqual({
        user: {
          id: '456',
          email: 'newuser@test.com',
          role: 'user',
          name: 'New User',
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      // Note: Token storage is now handled by httpClient interceptor
    });
  });

  describe('refreshToken', () => {
    it('should unwrap backend response', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Token refreshed',
          data: {
            user: {
              id: '123',
              email: 'admin@test.com',
              role: 'admin',
            },
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await authApi.refreshToken('old-refresh-token');

      expect(result).toEqual({
        user: {
          id: '123',
          email: 'admin@test.com',
          role: 'admin',
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      // Note: Token storage is now handled by httpClient interceptor
    });
  });

  describe('logout', () => {
    it('should call logout endpoint and clear tokens', async () => {
      httpClient.post.mockResolvedValue({ data: { success: true } });

      await authApi.logout();

      expect(httpClient.post).toHaveBeenCalled();
      expect(TokenManager.clearAll).toHaveBeenCalled();
    });

    it('should clear tokens even if logout API fails', async () => {
      httpClient.post.mockRejectedValue(new Error('Network error'));

      await authApi.logout();

      expect(TokenManager.clearAll).toHaveBeenCalled();
    });
  });
});
