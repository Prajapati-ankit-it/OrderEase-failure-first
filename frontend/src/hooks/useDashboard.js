/**
 * useDashboard Hook
 * Custom hook for admin dashboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ordersApi } from '../services/api';
import { getOrderStatusColor } from '../utils';

const useDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await ordersApi.getAllOrders();
      if (!isMounted.current) return;
      
      const totalOrders = data.length;
      const pendingOrders = data.filter(o => o.status === 'pending' || o.status === 'preparing').length;
      const completedOrders = data.filter(o => o.status === 'delivered' || o.status === 'ready').length;
      const totalRevenue = data.reduce((sum, order) => sum + order.totalPrice, 0);

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
      });

      setRecentOrders(data.slice(0, 5));
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (!isMounted.current) return;
      setLoading(false);
      setError(error.message || 'Failed to load dashboard data');
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentOrders,
    loading,
    error,
    getStatusColor: getOrderStatusColor,
  };
};

export default useDashboard;
