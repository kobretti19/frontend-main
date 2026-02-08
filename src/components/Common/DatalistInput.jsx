import React from 'react';

/**
 * Reusable Datalist Input Component
 * Input with autocomplete suggestions
 */
const DatalistInput = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder, 
  id,
  required = false 
}) => {
  const listId = id || `datalist-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div>
      {label && (
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          {label} {required && '*'}
        </label>
      )}
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='input-field'
        placeholder={placeholder}
        list={listId}
        required={required}
      />
      <datalist id={listId}>
        {options.map((opt, index) => (
          <option key={index} value={opt} />
        ))}
      </datalist>
    </div>
  );
};

export default DatalistInput;
