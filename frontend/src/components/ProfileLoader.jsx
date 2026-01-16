/**
 * ProfileLoader Component
 * Loads user profile from backend on app initialization
 * Ensures user data is fresh and not from stale localStorage
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../redux/slices/authSlice';

const ProfileLoader = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isFetchingProfile = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    // Track component mount status
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // If authenticated but no user data, fetch profile from backend
    // user === undefined means not loaded yet, null means no user
    if (isAuthenticated && user === undefined && !isFetchingProfile.current) {
      isFetchingProfile.current = true;
      dispatch(fetchUserProfile())
        .catch((error) => {
          if (isMounted.current) {
            console.error('Failed to load user profile:', error);
          }
        })
        .finally(() => {
          if (isMounted.current) {
            isFetchingProfile.current = false;
          }
        });
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Listen for token refresh events and reload profile
    const handleTokenRefresh = () => {
      // Only fetch if still authenticated and mounted
      if (isAuthenticated && isMounted.current) {
        dispatch(fetchUserProfile()).catch((error) => {
          if (isMounted.current) {
            console.error('Failed to reload user profile after token refresh:', error);
          }
        });
      }
    };

    window.addEventListener('auth:tokenRefreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('auth:tokenRefreshed', handleTokenRefresh);
    };
  }, [dispatch, isAuthenticated]);

  return null;
};

export default ProfileLoader;
