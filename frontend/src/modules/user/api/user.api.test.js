/**
 * User API Tests
 * Tests user profile and related API calls
 */

import userApi from './user.api';
import httpClient from '../../../services/api/httpClient';
import { API_ENDPOINTS } from '../../../config/api.config';
import { UserRole } from '../constants/userRoles';

// Mock httpClient
jest.mock('../../../services/api/httpClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe('User API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch user profile from backend', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Profile fetched successfully',
          data: {
            id: '123',
            email: 'user@test.com',
            name: 'Test User',
            role: UserRole.USER,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await userApi.getProfile();

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.USER.PROFILE);
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should handle profile fetch error', async () => {
      const mockError = {
        message: 'Failed to fetch profile',
        type: 'SERVER_ERROR',
      };

      httpClient.get.mockRejectedValue(mockError);

      await expect(userApi.getProfile()).rejects.toEqual(mockError);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const profileData = {
        name: 'Updated Name',
        email: 'updated@test.com',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Profile updated successfully',
          data: {
            id: '123',
            email: 'updated@test.com',
            name: 'Updated Name',
            role: UserRole.USER,
          },
        },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await userApi.updateProfile(profileData);

      expect(httpClient.put).toHaveBeenCalledWith(API_ENDPOINTS.USER.PROFILE, profileData);
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Password updated successfully',
        },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await userApi.updatePassword(passwordData);

      expect(httpClient.put).toHaveBeenCalledWith(API_ENDPOINTS.USER.UPDATE_PASSWORD, passwordData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserOrders', () => {
    it('should fetch user orders with default pagination', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Orders fetched successfully',
          data: {
            orders: [
              { id: '1', total: 50 },
              { id: '2', total: 75 },
            ],
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
              totalPages: 1,
            },
          },
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await userApi.getUserOrders();

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.USER.ORDERS, {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should fetch user orders with custom pagination', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Orders fetched successfully',
          data: {
            orders: [],
            pagination: {
              total: 0,
              page: 2,
              limit: 5,
              totalPages: 0,
            },
          },
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await userApi.getUserOrders(2, 5);

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.USER.ORDERS, {
        params: { page: 2, limit: 5 },
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });
});
