/**
 * useOrdersManagement Hook
 * Custom hook for orders management with pagination and polling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ordersApi } from '../services/api';
import { ORDER_STATUSES } from '../constants';
import { getOrderStatusColor } from '../utils';

const ORDERS_PER_PAGE = 10;

const useOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: ORDERS_PER_PAGE,
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
      const params = { page, limit: ORDERS_PER_PAGE };
      
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
  }, []);

  useEffect(() => {
    const currentStatus = selectedStatus === 'All' ? null : selectedStatus;
    fetchOrders(pagination.page, currentStatus);
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders(pagination.page, currentStatus);
    }, 30000);
    
    return () => clearInterval(interval);
  // fetchOrders is stable (defined with useCallback and empty deps array)
  // so it's safe to exclude from dependencies to avoid false warnings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, selectedStatus]);

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
  // fetchOrders is stable - see comment above useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, pagination.page]);

  const handleStatusFilterChange = useCallback((status) => {
    // Note: This triggers two state updates. In React 18+, these are automatically
    // batched to prevent multiple renders. The alternative (useReducer) would require
    // more boilerplate for minimal benefit in this case.
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
