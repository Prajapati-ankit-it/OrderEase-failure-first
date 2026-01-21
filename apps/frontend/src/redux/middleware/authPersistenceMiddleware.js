/**
 * Auth Persistence Middleware
 * Handles localStorage synchronization for authentication state
 * Separates side effects from reducers following Redux best practices
 * Note: User data is NOT persisted to localStorage - it's always loaded from backend
 */

const authPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Handle authentication state changes
  switch (action.type) {
    case 'auth/setCredentials':
    case 'auth/loginUser/fulfilled':
    case 'auth/registerUser/fulfilled':
      // Persist only token to localStorage
      // User data will be fetched from backend on next load
      if (state.auth.token) {
        localStorage.setItem('token', state.auth.token);
      }
      break;

    case 'auth/logout':
    case 'auth/logoutUser/fulfilled':
    case 'auth/logoutUser/rejected':
      // Clear all auth data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      break;

    default:
      // No localStorage action needed
      break;
  }

  return result;
};

export default authPersistenceMiddleware;
