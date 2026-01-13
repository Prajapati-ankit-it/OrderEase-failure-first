/**
 * useCheckout Hook
 * Custom hook for checkout operations and form management
 */

import { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { clearCart } from '../redux/slices/cartSlice';

const useCheckout = () => {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    orderType: 'dine-in',
    tableNumber: '',
    deliveryAddress: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const placeOrder = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        customerName: formData.customerName,
        phone: formData.phone,
        items: items.map((item) => ({
          itemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice,
        orderType: formData.orderType,
        tableNumber: formData.orderType === 'dine-in' ? formData.tableNumber : undefined,
        deliveryAddress: formData.orderType === 'delivery' ? formData.deliveryAddress : undefined,
      };

      const data = await ordersApi.createOrder(orderData);
      dispatch(clearCart());
      navigate(`/order-confirmation/${data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to place order');
      setLoading(false);
    }
  }, [formData, items, totalPrice, dispatch, navigate]);

  const redirectIfEmptyCart = useCallback(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  return {
    formData,
    loading,
    error,
    totalPrice,
    items,
    handleChange,
    placeOrder,
    redirectIfEmptyCart,
  };
};

export default useCheckout;
