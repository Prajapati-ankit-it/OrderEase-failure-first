/**
 * useMenu Hook
 * Custom hook for menu page with filtering and data fetching
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../redux/slices/menuSlice';
import { MENU_CATEGORIES } from '../constants';

const useMenu = () => {
  const dispatch = useDispatch();
  const { items: menuItems, loading, error } = useSelector((state) => state.menu);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    dispatch(fetchMenuItems({ available: true }));
  }, [dispatch]);

  const handleRetry = useCallback(() => {
    dispatch(fetchMenuItems({ available: true }));
  }, [dispatch]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const filteredItems = useMemo(() => {
    // Ensure menuItems is always an array
    const items = Array.isArray(menuItems) ? menuItems : [];
    return selectedCategory === 'All'
      ? items
      : items.filter(item => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  return {
    menuItems: filteredItems,
    loading,
    error,
    selectedCategory,
    categories: MENU_CATEGORIES,
    handleRetry,
    handleCategoryChange,
  };
};

export default useMenu;
