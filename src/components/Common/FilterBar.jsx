import React from 'react';

/**
 * Reusable Filter Bar Component
 */
const FilterBar = ({ filters, searchTerm, onClearFilters }) => {
  const hasActiveFilters = filters.some((f) => f.value);

  return (
    <div className='card mb-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4'>
        <div className='flex-1'>
          {searchTerm && (
            <p className='text-sm text-gray-600'>
              Searching for:{' '}
              <span className='font-medium text-gray-900'>"{searchTerm}"</span>
            </p>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          {filters.map((filter, index) => (
            <select
              key={index}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className='input-field'
            >
              <option value=''>{filter.placeholder}</option>
              {filter.options.map((opt) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </select>
          ))}

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className='btn-secondary whitespace-nowrap'
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
