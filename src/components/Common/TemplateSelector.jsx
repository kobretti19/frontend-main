import React from 'react';

/**
 * Reusable Template Selector Component
 * Dropdown to select equipment template
 */
const TemplateSelector = ({ templates, value, onChange, disabled = false }) => {
  return (
    <div className='bg-blue-50 p-4 rounded-lg'>
      <label className='block text-sm font-medium text-blue-800 mb-2'>
        Use Template (Optional)
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='input-field'
        disabled={disabled}
      >
        <option value=''>-- Create from scratch --</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.parts_data?.length || 0} parts)
            {t.brand && ` • ${t.brand}`}
          </option>
        ))}
      </select>
      {value && (
        <p className='text-sm text-blue-600 mt-2'>
          ✓ Parts will be loaded from template automatically
        </p>
      )}
    </div>
  );
};

export default TemplateSelector;
