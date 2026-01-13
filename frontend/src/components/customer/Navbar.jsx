import React from 'react';
import { Link } from 'react-router-dom';
import { useNavbar } from '../../hooks';

const Navbar = () => {
  const { cartCount } = useNavbar();

  return (
    <nav className="bg-orange-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            OrderEase
          </Link>
          <div className="flex gap-6 items-center">
            <Link to="/" className="hover:text-orange-200 transition">
              Menu
            </Link>
            <Link to="/cart" className="relative hover:text-orange-200 transition">
              <span className="text-lg">🛒 Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
