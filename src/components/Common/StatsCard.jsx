import React from 'react';

/**
 * Reusable Stats Card Component
 */
const StatsCard = ({ label, value, color = 'gray', icon }) => {
  const colorClasses = {
    gray: 'text-gray-900',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  };

  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-gray-600'>{label}</p>
        {icon && <span className='text-2xl'>{icon}</span>}
      </div>
      <p className={`text-3xl font-bold mt-2 ${colorClasses[color] || colorClasses.gray}`}>
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
