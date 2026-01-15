/**
 * useMenuManagement Hook
 * Custom hook for menu CRUD operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { foodApi } from '../services/api';
import { MENU_CATEGORIES, INITIAL_MENU_FORM_DATA } from '../constants';

const useMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(INITIAL_MENU_FORM_DATA);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      const data = await foodApi.getAllFoodItems();
      if (!isMounted.current) return;
      setMenuItems(data);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching menu:', error);
      if (!isMounted.current) return;
      setLoading(false);
      setError(error.message || 'Failed to load menu items');
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleChange = useCallback((e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(INITIAL_MENU_FORM_DATA);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingItem) {
        await foodApi.updateFoodItem(editingItem._id, formData);
      } else {
        await foodApi.createFoodItem(formData);
      }
      fetchMenuItems();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
      setError(error.message || 'Failed to save menu item');
    }
  }, [editingItem, formData, fetchMenuItems, handleCloseModal]);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      image: item.image || '',
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setError('');
      try {
        await foodApi.deleteFoodItem(id);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        setError(error.message || 'Failed to delete menu item');
      }
    }
  }, [fetchMenuItems]);

  const openAddModal = useCallback(() => {
    setShowModal(true);
  }, []);

  return {
    menuItems,
    showModal,
    editingItem,
    loading,
    error,
    formData,
    categories: MENU_CATEGORIES,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCloseModal,
    openAddModal,
  };
};

export default useMenuManagement;
