/**
 * API Configuration
 * Centralized configuration for API Gateway integration
 */

const getApiBaseUrl = () => {
  // Environment-based API URL configuration
  const envUrl = process.env.REACT_APP_API_URL;
  const envGatewayUrl = process.env.REACT_APP_API_GATEWAY_URL;
  
  // Priority: API_GATEWAY_URL > API_URL > default
  return envGatewayUrl || envUrl || 'http://localhost:4000/api';
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
    REGISTER: '/auth/signup', // Backend uses /auth/signup
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PASSWORD: '/user/password',
    ORDERS: '/user/orders',
  },
  // Public Menu endpoints (for customers)
  MENU: {
    LIST: '/menu',
    BY_ID: (id) => `/menu/${id}`,
  },
  // Food endpoints (for admin menu management)
  FOOD: {
    LIST: '/food',
    BY_ID: (id) => `/food/${id}`,
    CREATE: '/food',
    UPDATE: (id) => `/food/${id}`,
    DELETE: (id) => `/food/${id}`,
  },
  // Order endpoints
  ORDERS: {
    LIST: '/order',
    BY_ID: (id) => `/order/${id}`,
    CREATE: '/order',
    CREATE_FROM_CART: '/order/from-cart',
    UPDATE_STATUS: (id) => `/order/${id}/status`,
    DELETE: (id) => `/order/${id}`,
  },
  // Cart endpoints
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
