/**
 * useMenuItem Hook
 * Custom hook for menu item component logic
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const useMenuItem = (item) => {
  const dispatch = useDispatch();

  const handleAddToCart = useCallback(() => {
    dispatch(addToCart(item));
  }, [dispatch, item]);

  return {
    handleAddToCart,
  };
};

export default useMenuItem;
