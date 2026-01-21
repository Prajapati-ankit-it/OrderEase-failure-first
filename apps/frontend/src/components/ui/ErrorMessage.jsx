/**
 * Error Message Component
 * Display error messages with retry functionality
 */

import React from 'react';

const ErrorMessage = ({ 
  message = 'An error occurred', 
  onRetry, 
  className = '' 
}) => {
  return (
    <div 
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
              aria-label="Retry action"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
