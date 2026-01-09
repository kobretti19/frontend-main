import React, { useState } from 'react';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';

const PartsColorsTable = ({
  partsColors,
  parts,
  colors,
  onEdit,
  onDelete,
  onUpdateQuantity,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [editFormData, setEditFormData] = useState({
    part_id: '',
    color_id: '',
    quantity: '',
    min_stock_level: '',
    order_number: '',
  });

  const [quantityFormData, setQuantityFormData] = useState({
    quantity: '',
    adjustment_type: 'add',
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditFormData({
      part_id: item.part_id || '',
      color_id: item.color_id || '',
      quantity: item.quantity || '',
      min_stock_level: item.min_stock_level || '',
      order_number: item.order_number || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleQuantityClick = (item) => {
    setSelectedItem(item);
    setQuantityFormData({
      quantity: '',
      adjustment_type: 'add',
    });
    setShowQuantityModal(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    onEdit(selectedItem, {
      part_id: parseInt(editFormData.part_id),
      color_id: parseInt(editFormData.color_id),
      quantity: parseInt(editFormData.quantity),
      min_stock_level: parseInt(editFormData.min_stock_level),
      order_number: editFormData.order_number || null,
    });
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const handleSubmitQuantity = (e) => {
    e.preventDefault();
    onUpdateQuantity(selectedItem, {
      quantity: parseInt(quantityFormData.quantity),
      adjustment_type: quantityFormData.adjustment_type,
    });
    setShowQuantityModal(false);
    setSelectedItem(null);
  };

  const confirmDelete = () => {
    onDelete(selectedItem);
    setShowDeleteDialog(false);
    setSelectedItem(null);
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'in_stock':
        return '✓';
      case 'low_stock':
        return '⚠';
      case 'out_of_stock':
        return '✕';
      default:
        return '?';
    }
  };

  return (
    <>
      <div className='card overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Part
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Color
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Order Number
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Quantity
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Min Level
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Purchase Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Selling Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {partsColors.map((item) => (
              <tr key={item.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {item.part_name}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {item.color_name}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono'>
                  {item.order_number || '-'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>
                  <button
                    onClick={() => handleQuantityClick(item)}
                    className='text-blue-600 hover:text-blue-900 font-bold'
                  >
                    {item.quantity}
                  </button>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {item.min_stock_level}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                  {parseFloat(item.purchase_price || 0).toFixed(2)} CHF
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium'>
                  {parseFloat(item.selling_price || 0).toFixed(2)} CHF
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(
                      item.stock_status
                    )}`}
                  >
                    {getStockIcon(item.stock_status)}{' '}
                    {item.stock_status?.replace('_', ' ')}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                  <button
                    onClick={() => handleEdit(item)}
                    className='text-blue-600 hover:text-blue-900'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className='text-red-600 hover:text-red-900'
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal - No price fields */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Part Color'
        size='md'
      >
        <form onSubmit={handleSubmitEdit}>
          <div className='space-y-4'>
            {/* Show current prices from part (read-only info) */}
            {selectedItem && (
              <div className='bg-blue-50 p-3 rounded-lg text-sm'>
                <p className='text-blue-800'>
                  <strong>Prices are set on the Part level.</strong> To change
                  prices, edit the part directly.
                </p>
                <p className='text-blue-600 mt-1'>
                  Current: Purchase{' '}
                  {parseFloat(selectedItem.purchase_price || 0).toFixed(2)} CHF
                  / Selling{' '}
                  {parseFloat(selectedItem.selling_price || 0).toFixed(2)} CHF
                </p>
              </div>
            )}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Part
              </label>
              <select
                value={editFormData.part_id}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, part_id: e.target.value })
                }
                className='input-field'
                required
              >
                <option value=''>Select part</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Color
              </label>
              <select
                value={editFormData.color_id}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, color_id: e.target.value })
                }
                className='input-field'
                required
              >
                <option value=''>Select color</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Quantity
              </label>
              <input
                type='number'
                value={editFormData.quantity}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, quantity: e.target.value })
                }
                className='input-field'
                min='0'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Min Stock Level
              </label>
              <input
                type='number'
                value={editFormData.min_stock_level}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    min_stock_level: e.target.value,
                  })
                }
                className='input-field'
                min='0'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Order Number
              </label>
              <input
                type='text'
                value={editFormData.order_number}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    order_number: e.target.value,
                  })
                }
                className='input-field'
                placeholder='Enter order number'
              />
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowEditModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Quantity Modal */}
      <Modal
        isOpen={showQuantityModal}
        onClose={() => setShowQuantityModal(false)}
        title='Update Quantity'
        size='sm'
      >
        <form onSubmit={handleSubmitQuantity}>
          <div className='space-y-4'>
            {selectedItem && (
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-600'>Current Quantity</p>
                <p className='text-3xl font-bold text-gray-900'>
                  {selectedItem.quantity}
                </p>
                <p className='text-sm text-gray-600 mt-2'>
                  {selectedItem.part_name} - {selectedItem.color_name}
                </p>
              </div>
            )}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Adjustment Type
              </label>
              <select
                value={quantityFormData.adjustment_type}
                onChange={(e) =>
                  setQuantityFormData({
                    ...quantityFormData,
                    adjustment_type: e.target.value,
                  })
                }
                className='input-field'
              >
                <option value='add'>Add to Stock</option>
                <option value='set'>Set Exact Amount</option>
                <option value='remove'>Remove from Stock</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {quantityFormData.adjustment_type === 'add'
                  ? 'Quantity to Add'
                  : quantityFormData.adjustment_type === 'remove'
                  ? 'Quantity to Remove'
                  : 'New Total Quantity'}
              </label>
              <input
                type='number'
                value={quantityFormData.quantity}
                onChange={(e) =>
                  setQuantityFormData({
                    ...quantityFormData,
                    quantity: e.target.value,
                  })
                }
                className='input-field'
                min='0'
                required
              />
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowQuantityModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-success'>
                Update Quantity
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title='Delete Part Color'
        message={`Are you sure you want to delete "${selectedItem?.part_name} - ${selectedItem?.color_name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default PartsColorsTable;
