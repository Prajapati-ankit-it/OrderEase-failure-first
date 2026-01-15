/**
 * useCart Hook
 * Custom hook for cart page operations
 */

import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';

const useCart = () => {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const handleQuantityChange = useCallback((id, quantity) => {
    if (quantity < 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  }, [dispatch]);

  const handleRemoveItem = useCallback((id) => {
    dispatch(removeFromCart(id));
  }, [dispatch]);

  const handleCheckout = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const navigateToMenu = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    items,
    totalPrice,
    handleQuantityChange,
    handleRemoveItem,
    handleCheckout,
    handleClearCart,
    navigateToMenu,
  };
};

export default useCart;
