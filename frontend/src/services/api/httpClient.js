/**
 * HTTP Client
 * Enhanced Axios client with interceptors for authentication, error handling, and token refresh
 */

import axios from 'axios';
import apiConfig, { ERROR_MESSAGES, API_ENDPOINTS } from '../../config/api.config';

// Create axios instance
const httpClient = axios.create(apiConfig);

// Token management utilities
const TokenManager = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setRefreshToken: (token) => localStorage.setItem('refreshToken', token),
  removeRefreshToken: () => localStorage.removeItem('refreshToken'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
  clearAll: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// Track if token refresh is in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Extract error message from backend response
 * Checks both error and message fields with fallback
 */
const extractErrorMessage = (errorResponse, defaultMessage) => {
  return errorResponse?.error || errorResponse?.message || defaultMessage;
};

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
httpClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors globally, manages token refresh, and auto-stores tokens from auth responses
 */
httpClient.interceptors.response.use(
  (response) => {
    // Auto-store tokens from auth endpoints
    if (response.config.url?.includes('/auth/login') || 
        response.config.url?.includes('/auth/signup') ||
        response.config.url?.includes('/auth/refresh')) {
      const responseData = response.data?.data;
      if (responseData?.accessToken) {
        TokenManager.setToken(responseData.accessToken);
      }
      if (responseData?.refreshToken) {
        TokenManager.setRefreshToken(responseData.refreshToken);
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        type: 'NETWORK_ERROR',
        originalError: error,
      });
    }

    const { status } = error.response;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false;
        TokenManager.removeToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          type: 'UNAUTHORIZED',
          originalError: error,
        });
      }

      try {
        // Attempt to refresh the token
        const { data } = await axios.post(
          `${apiConfig.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        // Backend returns: { success, message, data: { user, accessToken, refreshToken } }
        const { data: responseData } = data;
        const newAccessToken = responseData.accessToken;

        TokenManager.setToken(newAccessToken);
        if (responseData.refreshToken) {
          TokenManager.setRefreshToken(responseData.refreshToken);
        }

        // Dispatch event to notify that the auth token was refreshed
        // Listeners should check isAuthenticated state rather than rely on event data
        window.dispatchEvent(
          new CustomEvent('auth:tokenRefreshed', {
            detail: {
              success: true,
              refreshedAt: Date.now(),
            },
          })
        );

        // Update the failed requests with new token
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        isRefreshing = false;
        TokenManager.removeToken();
        TokenManager.removeRefreshToken();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          type: 'UNAUTHORIZED',
          originalError: refreshError,
        });
      }
    }

    // Handle other HTTP errors
    let errorMessage = ERROR_MESSAGES.DEFAULT;
    let errorType = 'UNKNOWN_ERROR';

    switch (status) {
      case 400:
        errorMessage = extractErrorMessage(error.response.data, ERROR_MESSAGES.BAD_REQUEST);
        errorType = 'BAD_REQUEST';
        break;
      case 403:
        errorMessage = extractErrorMessage(error.response.data, ERROR_MESSAGES.FORBIDDEN);
        errorType = 'FORBIDDEN';
        break;
      case 404:
        errorMessage = extractErrorMessage(error.response.data, ERROR_MESSAGES.NOT_FOUND);
        errorType = 'NOT_FOUND';
        break;
      case 408:
        errorMessage = ERROR_MESSAGES.TIMEOUT;
        errorType = 'TIMEOUT';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = extractErrorMessage(error.response.data, ERROR_MESSAGES.SERVER_ERROR);
        errorType = 'SERVER_ERROR';
        break;
      default:
        errorMessage = extractErrorMessage(error.response.data, ERROR_MESSAGES.DEFAULT);
        errorType = 'API_ERROR';
    }

    return Promise.reject({
      message: errorMessage,
      type: errorType,
      status,
      data: error.response.data,
      originalError: error,
    });
  }
);

export default httpClient;
export { TokenManager };
