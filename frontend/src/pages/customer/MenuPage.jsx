import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../../redux/slices/menuSlice';
import MenuItem from '../../components/customer/MenuItem';
import Navbar from '../../components/customer/Navbar';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/ui';

const MenuPage = () => {
  const dispatch = useDispatch();
  const { items: menuItems, loading, error } = useSelector((state) => state.menu);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Starters', 'Main Course', 'Fast Food', 'Drinks', 'Desserts'];

  useEffect(() => {
    dispatch(fetchMenuItems({ available: true }));
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchMenuItems({ available: true }));
  };

  const filteredItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Menu</h1>
          <p className="text-gray-600">Choose from our delicious selection</p>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
              aria-label={`Filter by ${category}`}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <LoadingSpinner size="xl" className="py-20" />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No items found"
            description={`No menu items available${selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}`}
            action={() => setSelectedCategory('All')}
            actionLabel="View All Items"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuItem key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
