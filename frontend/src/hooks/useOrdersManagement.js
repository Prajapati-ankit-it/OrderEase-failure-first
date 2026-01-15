/**
 * useOrdersManagement Hook
 * Custom hook for orders management with polling
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ordersApi } from '../services/api';
import { ORDER_STATUSES } from '../constants';
import { getOrderStatusColor } from '../utils';

const useOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await ordersApi.getAllOrders();
      if (!isMounted.current) return;
      setOrders(data);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!isMounted.current) return;
      setLoading(false);
      setError(error.message || 'Failed to load orders');
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
    setError('');
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      // Optimistic update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error.message || 'Failed to update order status');
      // Refresh to get accurate state
      fetchOrders();
    }
  }, [fetchOrders]);

  const handleStatusFilterChange = useCallback((status) => {
    setSelectedStatus(status);
  }, []);

  const handleOrderSelect = useCallback((order) => {
    setSelectedOrder(order);
  }, []);

  const handleCloseOrderDetails = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const filteredOrders = useMemo(() => {
    return selectedStatus === 'All'
      ? orders
      : orders.filter(order => order.status === selectedStatus);
  }, [orders, selectedStatus]);

  return {
    orders: filteredOrders,
    selectedStatus,
    loading,
    error,
    selectedOrder,
    statuses: ORDER_STATUSES,
    fetchOrders,
    handleStatusUpdate,
    getStatusColor: getOrderStatusColor,
    handleStatusFilterChange,
    handleOrderSelect,
    handleCloseOrderDetails,
  };
};

export default useOrdersManagement;
