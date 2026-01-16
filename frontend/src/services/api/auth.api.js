/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import httpClient, { TokenManager } from './httpClient';
import { API_ENDPOINTS } from '../../config/api.config';

const authApi = {
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} User data with token
   */
  login: async (credentials) => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Backend returns: { success, message, data: { user, accessToken, refreshToken } }
    // Token storage handled by httpClient interceptor
    const { data: responseData } = response.data;
    
    return responseData;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role (optional)
   * @returns {Promise} User data with token
   */
  register: async (userData) => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    // Backend returns: { success, message, data: { user, accessToken, refreshToken } }
    // Token storage handled by httpClient interceptor
    const { data: responseData } = response.data;
    
    return responseData;
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    const response = await httpClient.get(API_ENDPOINTS.USER.PROFILE);
    // Backend returns: { success, message, data: user }
    return response.data.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} New token data
   */
  refreshToken: async (refreshToken) => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    // Backend returns: { success, message, data: { user, accessToken, refreshToken } }
    // Token storage is handled automatically by httpClient response interceptor
    // which detects /auth/refresh URL and stores tokens from response.data.data
    const { data: responseData } = response.data;
    
    return responseData;
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      // Call logout endpoint if it exists
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear all stored credentials using TokenManager
      TokenManager.clearAll();
    }
  },
};

export default authApi;
