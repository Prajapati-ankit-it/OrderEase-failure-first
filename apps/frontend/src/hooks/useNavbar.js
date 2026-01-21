/**
 * useNavbar Hook
 * Custom hook for customer navbar logic
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useNavbar = () => {
  const { items } = useSelector((state) => state.cart);
  
  const cartCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return {
    cartCount,
  };
};

export default useNavbar;
