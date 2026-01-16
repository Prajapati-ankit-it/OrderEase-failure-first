/**
 * useOrdersManagement Hook
 * Custom hook for orders management with pagination and polling
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ordersApi } from '../services/api';
import { ORDER_STATUSES } from '../constants';
import { getOrderStatusColor } from '../utils';

const useOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
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

  const fetchOrders = useCallback(async (page = 1, status = null) => {
    try {
      setLoading(true);
      const params = { page, limit: pagination.limit };
      
      // Only add status filter if it's not 'All'
      if (status && status !== 'All') {
        params.status = status;
      }
      
      const data = await ordersApi.getAllOrders(params);
      
      if (!isMounted.current) return;
      
      // Handle paginated response
      if (data && data.orders && data.pagination) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        // Fallback for non-paginated response
        setOrders(data);
        setPagination(prev => ({ ...prev, total: data.length, totalPages: 1 }));
      } else {
        setOrders([]);
      }
      
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!isMounted.current) return;
      setLoading(false);
      setError(error.message || 'Failed to load orders');
    }
  }, [pagination.limit]);

  useEffect(() => {
    const currentStatus = selectedStatus === 'All' ? null : selectedStatus;
    fetchOrders(pagination.page, currentStatus);
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders(pagination.page, currentStatus);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [pagination.page, selectedStatus, fetchOrders]);

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
      const currentStatus = selectedStatus === 'All' ? null : selectedStatus;
      fetchOrders(pagination.page, currentStatus);
    }
  }, [selectedStatus, pagination.page, fetchOrders]);

  const handleStatusFilterChange = useCallback((status) => {
    setSelectedStatus(status);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filtering
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleOrderSelect = useCallback((order) => {
    setSelectedOrder(order);
  }, []);

  const handleCloseOrderDetails = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  return {
    orders: Array.isArray(orders) ? orders : [],
    pagination,
    selectedStatus,
    loading,
    error,
    selectedOrder,
    statuses: ORDER_STATUSES,
    fetchOrders,
    handleStatusUpdate,
    getStatusColor: getOrderStatusColor,
    handleStatusFilterChange,
    handlePageChange,
    handleOrderSelect,
    handleCloseOrderDetails,
  };
};

export default useOrdersManagement;
