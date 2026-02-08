import React from 'react';

/**
 * Reusable Empty State Component
 */
const EmptyState = ({ 
  icon = '📦', 
  title, 
  message, 
  actionLabel, 
  onAction,
  hasItems = false 
}) => {
  return (
    <div className='card text-center py-12'>
      <div className='text-6xl mb-4'>{icon}</div>
      <p className='text-xl font-semibold text-gray-900 mb-2'>
        {hasItems ? 'No Results Found' : title}
      </p>
      <p className='text-gray-500 mb-6'>
        {hasItems 
          ? 'Try adjusting your search or filters' 
          : message}
      </p>
      {!hasItems && actionLabel && onAction && (
        <button onClick={onAction} className='btn-primary'>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
