/**
 * useUserProfile Hook
 * Custom hook for user profile operations
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../../../redux/slices/authSlice';
import { userApi } from '../api';

const useUserProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  /**
   * Refresh user profile from backend
   */
  const refreshProfile = useCallback(async () => {
    try {
      await dispatch(fetchUserProfile()).unwrap();
      return { success: true };
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return { success: false, error: err.message || 'Failed to refresh profile' };
    }
  }, [dispatch]);

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      await userApi.updateProfile(profileData);
      // Refresh profile to sync with backend
      const refreshResult = await refreshProfile();
      if (!refreshResult.success) {
        // Update succeeded but refresh failed - still return success with warning
        return { 
          success: true, 
          warning: 'Profile updated but failed to refresh. Please reload the page.' 
        };
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      return { success: false, error: errorMessage };
    }
  }, [refreshProfile]);

  /**
   * Update user password
   * @param {Object} passwordData - Password data
   */
  const updatePassword = useCallback(async (passwordData) => {
    try {
      await userApi.updatePassword(passwordData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update password';
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    user,
    loading,
    error,
    refreshProfile,
    updateProfile,
    updatePassword,
  };
};

export default useUserProfile;
