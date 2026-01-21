/**
 * Loading Skeleton Component
 * Placeholder for loading content
 */

import React from 'react';

const LoadingSkeleton = ({ type = 'text', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-300 rounded';

  const typeClasses = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    image: 'h-48 w-full',
    card: 'h-64 w-full',
    button: 'h-10 w-24',
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Skeleton for menu card
export const MenuCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <LoadingSkeleton type="image" className="h-48" />
    <div className="p-4 space-y-3">
      <LoadingSkeleton type="title" />
      <LoadingSkeleton type="text" />
      <LoadingSkeleton type="text" className="w-1/2" />
      <div className="flex justify-between items-center">
        <LoadingSkeleton type="text" className="w-20" />
        <LoadingSkeleton type="button" />
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
