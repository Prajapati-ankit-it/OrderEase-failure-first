/**
 * Example: How to use Backend DTOs in JavaScript with JSDoc
 * 
 * This file demonstrates how to properly type your API calls using the backend DTOs.
 * Copy these patterns to your actual API service files.
 */

// Import types for JSDoc annotations
/**
 * @typedef {import('types/backend').LoginDto} LoginDto
 * @typedef {import('types/backend').SignUpDto} SignUpDto
 * @typedef {import('types/backend').ApiResponse} ApiResponse
 * @typedef {import('types/backend').AuthResponseData} AuthResponseData
 * @typedef {import('types/backend').CreateFoodDto} CreateFoodDto
 * @typedef {import('types/backend').Food} Food
 * @typedef {import('types/backend').AddToCartDto} AddToCartDto
 * @typedef {import('types/backend').Cart} Cart
 * @typedef {import('types/backend').CreateOrderDto} CreateOrderDto
 * @typedef {import('types/backend').Order} Order
/**
 * @typedef {import('types/backend').UpdateOrderStatusDto} UpdateOrderStatusDto
 */

// These would be your actual imports in a real API service file:
// import httpClient from '../../services/api/httpClient';
// import { API_ENDPOINTS } from '../../config/api.config';

// For this example file, we'll use placeholder implementations
const httpClient = {
  post: async () => ({ data: {} }),
  get: async () => ({ data: {} }),
  put: async () => ({ data: {} }),
  delete: async () => ({ data: {} }),
};

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
  },
  FOOD: {
    LIST: '/food',
    CREATE: '/food',
  },
  CART: {
    ADD: '/cart',
  },
  ORDERS: {
    CREATE: '/order',
    UPDATE_STATUS: (id) => `/order/${id}/status`,
  },
};

// ============================================================================
// AUTH API EXAMPLES
// ============================================================================

/**
 * Login user with proper typing
 * @param {LoginDto} credentials - Login credentials (email, password)
 * @returns {Promise<ApiResponse<AuthResponseData>>} API response with auth data
 */
async function loginExample(credentials) {
  const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
}

/**
 * Register user with proper typing
 * @param {SignUpDto} userData - Registration data (email, password, name?, role?)
 * @returns {Promise<ApiResponse<AuthResponseData>>} API response with auth data
 */
async function registerExample(userData) {
  const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  return response.data;
}

// ============================================================================
// FOOD API EXAMPLES
// ============================================================================

/**
 * Create food item with proper typing
 * @param {CreateFoodDto} foodData - Food creation data
 * @returns {Promise<ApiResponse<Food>>} API response with created food item
 */
async function createFoodExample(foodData) {
  const response = await httpClient.post(API_ENDPOINTS.FOOD.CREATE, foodData);
  return response.data;
}

/**
 * Get all food items
 * @returns {Promise<ApiResponse<Food[]>>} API response with food items array
 */
async function getAllFoodExample() {
  const response = await httpClient.get(API_ENDPOINTS.FOOD.LIST);
  return response.data;
}

// ============================================================================
// CART API EXAMPLES
// ============================================================================

/**
 * Add item to cart with proper typing
 * @param {AddToCartDto} cartItem - Item to add (foodId, quantity)
 * @returns {Promise<ApiResponse<Cart>>} API response with updated cart
 */
async function addToCartExample(cartItem) {
  const response = await httpClient.post(API_ENDPOINTS.CART.ADD, cartItem);
  return response.data;
}

// ============================================================================
// ORDER API EXAMPLES
// ============================================================================

/**
 * Create order with proper typing
 * @param {CreateOrderDto} orderData - Order data with items array
 * @returns {Promise<ApiResponse<Order>>} API response with created order
 */
async function createOrderExample(orderData) {
  const response = await httpClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
  return response.data;
}

/**
 * Update order status with proper typing
 * @param {string} orderId - Order ID
 * @param {UpdateOrderStatusDto} statusData - New status
 * @returns {Promise<ApiResponse<Order>>} API response with updated order
 */
async function updateOrderStatusExample(orderId, statusData) {
  const response = await httpClient.put(
    API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
    statusData
  );
  return response.data;
}

// ============================================================================
// USAGE IN COMPONENTS
// ============================================================================

/**
 * Example React component using typed data
 */
function LoginComponent() {
  const handleLogin = async (email, password) => {
    try {
      /** @type {LoginDto} */
      const credentials = { email, password };
      
      const response = await loginExample(credentials);
      
      if (response.success && response.data) {
        // response.data is typed as AuthResponseData
        const { accessToken, user } = response.data;
        console.log('Logged in user:', user.email);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // Component JSX...
}

/**
 * Example component creating food item
 */
function CreateFoodComponent() {
  const handleCreateFood = async () => {
    try {
      /** @type {CreateFoodDto} */
      const foodData = {
        name: 'Pizza',
        price: 12.99,
        category: 'Italian',
        description: 'Delicious pizza',
        isAvailable: true,
      };
      
      const response = await createFoodExample(foodData);
      
      if (response.success && response.data) {
        // response.data is typed as Food
        console.log('Created food:', response.data.name);
      }
    } catch (error) {
      console.error('Create food failed:', error);
    }
  };
  
  // Component JSX...
}

export {
  loginExample,
  registerExample,
  createFoodExample,
  getAllFoodExample,
  addToCartExample,
  createOrderExample,
  updateOrderStatusExample,
};
