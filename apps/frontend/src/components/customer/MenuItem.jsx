import React from 'react';
import { useAddToCart } from '../../hooks';

const MenuItem = ({ item }) => {
  const { handleAddToCart } = useAddToCart(item);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
          <span className="text-orange-600 font-bold text-lg">₹{item.price}</span>
        </div>
        {item.description && (
          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
            {item.category}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              item.isAvailable
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
