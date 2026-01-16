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
    const data = response.data.data || response.data;
    
    // Store tokens if present
    if (data.accessToken) {
      TokenManager.setToken(data.accessToken);
    }
    if (data.refreshToken) {
      TokenManager.setRefreshToken(data.refreshToken);
    }
    
    return data;
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
    const data = response.data.data || response.data;
    
    // Store tokens if present
    if (data.accessToken) {
      TokenManager.setToken(data.accessToken);
    }
    if (data.refreshToken) {
      TokenManager.setRefreshToken(data.refreshToken);
    }
    
    return data;
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    const response = await httpClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data.data || response.data;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} New token data
   */
  refreshToken: async (refreshToken) => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    const data = response.data.data || response.data;
    
    if (data.accessToken) {
      TokenManager.setToken(data.accessToken);
    }
    if (data.refreshToken) {
      TokenManager.setRefreshToken(data.refreshToken);
    }
    
    return data;
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
