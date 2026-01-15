/**
 * useAdminNavbar Hook
 * Custom hook for admin navbar logic
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const useAdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/admin/login');
  }, [dispatch, navigate]);

  return {
    user,
    handleLogout,
  };
};

export default useAdminNavbar;
