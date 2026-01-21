/**
 * useAuth Hook
 * Custom hook for authentication operations
 */

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, registerUser, clearAuthError } from '../redux/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/admin/login');
    } catch (err) {
      // Still navigate even if logout fails
      navigate('/admin/login');
    }
  };

  const clearError = () => {
    dispatch(clearAuthError());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};

export default useAuth;
