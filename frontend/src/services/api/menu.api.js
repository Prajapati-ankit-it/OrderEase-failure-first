/**
 * Menu API Service
 * Handles all menu-related API calls
 */

import httpClient from './httpClient';
import { API_ENDPOINTS } from '../../config/api.config';

const menuApi = {
  /**
   * Get all menu items
   * @param {Object} params - Query parameters
   * @param {boolean} params.available - Filter by availability
   * @param {string} params.category - Filter by category
   * @returns {Promise} Array of menu items
   */
  getMenuItems: async (params = {}) => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.MENU.LIST, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get menu item by ID
   * @param {string} id - Menu item ID
   * @returns {Promise} Menu item data
   */
  getMenuItemById: async (id) => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.MENU.BY_ID(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new menu item (Admin only)
   * @param {Object} menuItemData - Menu item data
   * @param {string} menuItemData.name - Item name
   * @param {number} menuItemData.price - Item price
   * @param {string} menuItemData.category - Item category
   * @param {string} menuItemData.description - Item description
   * @param {string} menuItemData.image - Item image URL
   * @param {boolean} menuItemData.isAvailable - Item availability
   * @returns {Promise} Created menu item
   */
  createMenuItem: async (menuItemData) => {
    try {
      const response = await httpClient.post(API_ENDPOINTS.MENU.CREATE, menuItemData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update menu item (Admin only)
   * @param {string} id - Menu item ID
   * @param {Object} menuItemData - Updated menu item data
   * @returns {Promise} Updated menu item
   */
  updateMenuItem: async (id, menuItemData) => {
    try {
      const response = await httpClient.put(API_ENDPOINTS.MENU.UPDATE(id), menuItemData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete menu item (Admin only)
   * @param {string} id - Menu item ID
   * @returns {Promise}
   */
  deleteMenuItem: async (id) => {
    try {
      const response = await httpClient.delete(API_ENDPOINTS.MENU.DELETE(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get menu items by category
   * @param {string} category - Category name
   * @returns {Promise} Array of menu items
   */
  getMenuItemsByCategory: async (category) => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.MENU.LIST, {
        params: { category, available: true },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default menuApi;
