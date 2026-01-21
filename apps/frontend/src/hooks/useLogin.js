/**
 * useLogin Hook
 * Custom hook for login page with form validation and authentication
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { isValidEmail, validateRequired } from '../utils';
import { INITIAL_LOGIN_FORM_DATA } from '../constants';

const useLogin = () => {
  const [formData, setFormData] = useState(INITIAL_LOGIN_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) {
      newErrors.email = emailError;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordError = validateRequired(formData.password, 'Password');
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      
      // Check if user has admin role
      if (result.user?.role !== 'admin') {
        setApiError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setApiError(err || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  }, [formData, validateForm, dispatch, navigate]);

  const navigateToMenu = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    formData,
    errors,
    apiError,
    loading,
    handleChange,
    handleSubmit,
    navigateToMenu,
  };
};

export default useLogin;
