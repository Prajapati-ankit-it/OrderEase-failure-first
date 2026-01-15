/**
 * useOrderConfirmation Hook
 * Custom hook for order confirmation page
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ordersApi } from '../services/api';
import { getOrderStatusColor } from '../utils';

const useOrderConfirmation = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      console.error('useOrderConfirmation: orderId is required');
      if (isMounted.current) {
        setError('Order ID is missing');
        setLoading(false);
      }
      return;
    }

    try {
      const data = await ordersApi.getOrderById(orderId);
      if (!isMounted.current) return;
      setOrder(data);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching order:', error);
      if (!isMounted.current) return;
      setLoading(false);
      setError(error.message || 'Failed to load order');
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    getStatusColor: getOrderStatusColor,
  };
};

export default useOrderConfirmation;
