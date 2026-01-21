/**
 * User Roles
 * Matches backend UserRole enum
 */

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

/**
 * Check if user has admin role
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
  return user?.role === UserRole.ADMIN;
};

/**
 * Check if user has user role
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user is regular user
 */
export const isUser = (user) => {
  return user?.role === UserRole.USER;
};

/**
 * Check if user has any valid role
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user has a valid role
 */
export const hasValidRole = (user) => {
  return user?.role && Object.values(UserRole).includes(user.role);
};
