/**
 * Orders API Service
 * Handles all order-related API calls
 */

import httpClient from './httpClient';
import { API_ENDPOINTS } from '../../config/api.config';

const ordersApi = {
  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @param {string} orderData.customerName - Customer name
   * @param {string} orderData.phone - Customer phone
   * @param {Array} orderData.items - Order items
   * @param {number} orderData.totalPrice - Total price
   * @param {string} orderData.orderType - Order type (dine-in/delivery)
   * @param {string} orderData.tableNumber - Table number (optional)
   * @param {string} orderData.deliveryAddress - Delivery address (optional)
   * @returns {Promise} Created order
   */
  createOrder: async (orderData) => {
    const response = await httpClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
    return response.data.data || response.data;
  },

  /**
   * Create order from cart
   * @param {Object} orderData - Order data from cart
   * @param {boolean} orderData.clearCart - Whether to clear the cart after creating order (optional, default: true)
   * @returns {Promise} Created order
   */
  createOrderFromCart: async (orderData) => {
    const response = await httpClient.post(API_ENDPOINTS.ORDERS.CREATE_FROM_CART, orderData);
    return response.data.data || response.data;
  },

  /**
   * Get all orders
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.orderType - Filter by order type
   * @returns {Promise} Array of orders
   */
  getAllOrders: async (params = {}) => {
    const response = await httpClient.get(API_ENDPOINTS.ORDERS.LIST, { params });
    return response.data.data || response.data;
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise} Order data
   */
  getOrderById: async (id) => {
    const response = await httpClient.get(API_ENDPOINTS.ORDERS.BY_ID(id));
    return response.data.data || response.data;
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise} Updated order
   */
  updateOrderStatus: async (id, status) => {
    const response = await httpClient.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
    return response.data.data || response.data;
  },

  /**
   * Delete order
   * @param {string} id - Order ID
   * @returns {Promise}
   */
  deleteOrder: async (id) => {
    const response = await httpClient.delete(API_ENDPOINTS.ORDERS.DELETE(id));
    return response.data;
  },

  /**
   * Get order statistics (Admin only)
   * @returns {Promise} Order statistics
   */
  getOrderStats: async () => {
    const response = await httpClient.get(`${API_ENDPOINTS.ORDERS.LIST}/stats`);
    return response.data.data || response.data;
  },
};

export default ordersApi;
