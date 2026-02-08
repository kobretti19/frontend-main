import React, { useState } from 'react';

/**
 * Reusable Part Selector Component
 * Used in Equipment and Templates to add parts
 */
const PartSelector = ({ parts, onAdd, existingParts = [] }) => {
  const [currentPart, setCurrentPart] = useState({
    part_id: '',
    quantity_needed: 1,
    notes: '',
  });

  const handleAdd = () => {
    if (!currentPart.part_id) {
      alert('Please select a part');
      return;
    }

    if (!currentPart.quantity_needed || currentPart.quantity_needed <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const part = parts.find((p) => p.id === parseInt(currentPart.part_id));

    // Check stock
    if (part && part.quantity < parseInt(currentPart.quantity_needed)) {
      alert(`Insufficient stock! Available: ${part.quantity}, Needed: ${currentPart.quantity_needed}`);
      return;
    }

    // Check if already added
    const exists = existingParts.find((p) => p.part_id === parseInt(currentPart.part_id));
    if (exists) {
      alert('This part is already added');
      return;
    }

    const newPart = {
      part_id: parseInt(currentPart.part_id),
      quantity_needed: parseInt(currentPart.quantity_needed),
      notes: currentPart.notes,
      part_name: part?.name,
      part_color: part?.color,
      part_sku: part?.sku,
    };

    onAdd(newPart);
    setCurrentPart({ part_id: '', quantity_needed: 1, notes: '' });
  };

  return (
    <div className='bg-gray-50 p-4 rounded-lg'>
      <div className='grid grid-cols-4 gap-3 mb-3'>
        <select
          value={currentPart.part_id}
          onChange={(e) => setCurrentPart({ ...currentPart, part_id: e.target.value })}
          className='input-field col-span-2'
        >
          <option value=''>Select part</option>
          {parts.map((part) => (
            <option key={part.id} value={part.id}>
              {part.name} {part.color ? `(${part.color})` : ''} - Stock: {part.quantity || 0}
            </option>
          ))}
        </select>
        <input
          type='number'
          value={currentPart.quantity_needed}
          onChange={(e) => setCurrentPart({ ...currentPart, quantity_needed: e.target.value })}
          className='input-field'
          placeholder='Qty'
          min='1'
        />
        <button type='button' onClick={handleAdd} className='btn-success'>
          Add
        </button>
      </div>
      <input
        type='text'
        value={currentPart.notes}
        onChange={(e) => setCurrentPart({ ...currentPart, notes: e.target.value })}
        className='input-field'
        placeholder='Notes (optional)'
      />
    </div>
  );
};

export default PartSelector;
