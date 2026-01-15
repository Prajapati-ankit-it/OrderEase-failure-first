/**
 * Application Constants
 * Shared constants used across the application
 */

/**
 * Menu categories
 */
export const MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'Fast Food', 'Drinks', 'Desserts'];

/**
 * Order statuses for filtering
 */
export const ORDER_STATUSES = ['All', 'pending', 'preparing', 'ready', 'delivered'];

/**
 * Initial form data for menu management
 */
export const INITIAL_MENU_FORM_DATA = {
  name: '',
  price: '',
  category: 'Starters',
  description: '',
  image: '',
  isAvailable: true,
};

/**
 * Initial form data for login
 */
export const INITIAL_LOGIN_FORM_DATA = {
  email: '',
  password: '',
};
