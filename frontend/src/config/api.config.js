/**
 * API Configuration
 * Centralized configuration for API Gateway integration
 */

const getApiBaseUrl = () => {
  // Environment-based API URL configuration
  const envUrl = process.env.REACT_APP_API_URL;
  const envGatewayUrl = process.env.REACT_APP_API_GATEWAY_URL;
  
  // Priority: API_GATEWAY_URL > API_URL > default
  return envGatewayUrl || envUrl || 'http://localhost:5000/api';
};

const apiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using HTTP-only cookies
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  // Menu endpoints
  MENU: {
    LIST: '/menu',
    BY_ID: (id) => `/menu/${id}`,
    CREATE: '/menu',
    UPDATE: (id) => `/menu/${id}`,
    DELETE: (id) => `/menu/${id}`,
  },
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    BY_ID: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  // Cart endpoints (if backend supports)
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },
};

// Error messages mapping
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  DEFAULT: 'An unexpected error occurred. Please try again.',
};

export default apiConfig;
