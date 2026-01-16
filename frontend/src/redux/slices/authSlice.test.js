/**
 * Auth Slice Tests
 * Tests authentication state management
 */

import authReducer, {
  loginUser,
  logoutUser,
  setCredentials,
  clearAuthError,
} from './authSlice';
import { authApi } from '../../services/api';

// Mock the auth API
jest.mock('../../services/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('reducers', () => {
    it('should handle setCredentials with accessToken', () => {
      const credentials = {
        user: { id: '1', email: 'test@test.com', role: 'admin' },
        accessToken: 'test-token',
      };

      const state = authReducer(initialState, setCredentials(credentials));

      expect(state.user).toEqual(credentials.user);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle setCredentials with legacy token field', () => {
      const credentials = {
        user: { id: '1', email: 'test@test.com', role: 'admin' },
        token: 'legacy-token',
      };

      const state = authReducer(initialState, setCredentials(credentials));

      expect(state.token).toBe('legacy-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle clearAuthError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };

      const state = authReducer(stateWithError, clearAuthError());

      expect(state.error).toBeNull();
    });
  });

  describe('loginUser async thunk', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        user: { id: '1', email: 'admin@test.com', role: 'admin', name: 'Admin' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      authApi.login.mockResolvedValue(mockResponse);

      const action = await loginUser.fulfilled(mockResponse, '', {
        email: 'admin@test.com',
        password: 'password',
      });

      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe('access-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle login pending', () => {
      const action = loginUser.pending('', { email: '', password: '' });
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle login rejected', () => {
      const errorMessage = 'Invalid credentials';
      const action = loginUser.rejected(null, '', {}, errorMessage);
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('logoutUser async thunk', () => {
    it('should handle successful logout', async () => {
      authApi.logout.mockResolvedValue();

      const loggedInState = {
        user: { id: '1', email: 'test@test.com', role: 'admin' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      const action = await logoutUser.fulfilled(undefined, '');
      const state = authReducer(loggedInState, action);

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should handle logout even if API fails', async () => {
      authApi.logout.mockRejectedValue(new Error('Network error'));

      const loggedInState = {
        user: { id: '1', email: 'test@test.com', role: 'admin' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      const action = await logoutUser.rejected(null, '');
      const state = authReducer(loggedInState, action);

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
