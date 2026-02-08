import React from 'react';

/**
 * Reusable Parts List Table Component
 * Displays added parts with remove option
 */
const PartsListTable = ({ parts, onRemove, showRemove = true }) => {
  if (!parts || parts.length === 0) {
    return (
      <div className='text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
        <p className='text-gray-500'>No parts added yet.</p>
      </div>
    );
  }

  return (
    <div className='border rounded-lg overflow-hidden'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Part</th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Color</th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Qty</th>
            <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>Notes</th>
            {showRemove && (
              <th className='px-4 py-2 text-right text-xs font-medium text-gray-500'>Action</th>
            )}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {parts.map((part, index) => (
            <tr key={index}>
              <td className='px-4 py-2 text-sm font-medium'>
                {part.part_name || part.name}
                {part.part_sku && (
                  <span className='text-xs text-gray-400 ml-2'>({part.part_sku})</span>
                )}
              </td>
              <td className='px-4 py-2 text-sm'>
                {part.part_color || part.color || '-'}
              </td>
              <td className='px-4 py-2 text-sm'>
                {part.quantity_needed || part.quantity}
              </td>
              <td className='px-4 py-2 text-sm text-gray-500'>
                {part.notes || '-'}
              </td>
              {showRemove && (
                <td className='px-4 py-2 text-sm text-right'>
                  <button
                    type='button'
                    onClick={() => onRemove(index)}
                    className='text-red-600 hover:text-red-900'
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartsListTable;
