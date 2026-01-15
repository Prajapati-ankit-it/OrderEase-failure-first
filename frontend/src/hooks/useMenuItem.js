/**
 * useAddToCart Hook
 * Custom hook for adding menu items to cart
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

/**
 * Hook to handle adding a menu item to the cart
 * @param {Object} item - The menu item to add
 * @param {string} item._id - Required unique identifier
 * @returns {Object} Handler function for adding to cart
 */
const useAddToCart = (item) => {
  const dispatch = useDispatch();

  const handleAddToCart = useCallback(() => {
    if (!item || typeof item !== 'object' || !item._id) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('useAddToCart: item parameter must be an object with _id property', item);
      }
      return;
    }
    dispatch(addToCart(item));
  }, [dispatch, item]);

  return {
    handleAddToCart,
  };
};

export default useAddToCart;
