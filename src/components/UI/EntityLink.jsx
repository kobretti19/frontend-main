import React from 'react';
import { useEntityDetails } from '../../context/EntityDetailsContext';

const EntityLink = ({
  type,
  id,
  data = null,
  children,
  className = '',
  showIcon = false,
}) => {
  const { open } = useEntityDetails();

  if (!id) {
    return <span className={className}>{children}</span>;
  }

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    open(type, id, data);
  };

  const icons = {
    part: '🔧',
    part_color: '🎨',
    equipment: '📦',
    order: '🛒',
    color: '🎨',
    category: '📁',
    brand: '🏷️',
  };

  return (
    <button
      onClick={handleClick}
      className={`text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left ${className}`}
    >
      {showIcon && icons[type] && <span className='mr-1'>{icons[type]}</span>}
      {children}
    </button>
  );
};

export default EntityLink;
