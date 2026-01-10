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
  const [editData, setEditData] = useState({});
  const [quantityData, setQuantityData] = useState({
    quantity: '',
    adjustment_type: 'set',
  });

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setEditData({
      part_id: item.part_id,
      color_id: item.color_id,
      quantity: item.quantity,
      min_stock_level: item.min_stock_level,
      order_number: item.order_number || '',
      purchase_price: item.purchase_price || 0,
      selling_price: item.selling_price || 0,
    });
    setShowEditModal(true);
  };

  const handleOpenQuantity = (item) => {
    setSelectedItem(item);
    setQuantityData({
      quantity: item.quantity,
      adjustment_type: 'set',
    });
    setShowQuantityModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await onEdit(selectedItem, editData);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const handleQuantityUpdate = async (e) => {
    e.preventDefault();
    await onUpdateQuantity(selectedItem, quantityData);
    setShowQuantityModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    await onDelete(selectedItem);
    setShowDeleteDialog(false);
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    if (!status) return '-';
    return status.replace('_', ' ').toUpperCase();
  };

  const calculateMargin = (purchase, selling) => {
    const purchasePrice = parseFloat(purchase) || 0;
    const sellingPrice = parseFloat(selling) || 0;
    if (purchasePrice === 0) return { amount: 0, percent: 0 };
    const margin = sellingPrice - purchasePrice;
    const percent = (margin / purchasePrice) * 100;
    return { amount: margin, percent };
  };

  return (
    <>
      <div className='card overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Part
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Color
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Purchase
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Selling
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Margin
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Qty
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Min
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {partsColors.map((item) => {
              const margin = calculateMargin(
                item.purchase_price,
                item.selling_price
              );
              return (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-3'>
                    <p className='text-sm font-medium text-gray-900'>
                      {item.part_name}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {item.category_name}
                    </p>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-700'>
                    {item.color_name}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    CHF {parseFloat(item.purchase_price || 0).toFixed(2)}
                  </td>
                  <td className='px-4 py-3 text-sm text-green-600 font-medium'>
                    CHF {parseFloat(item.selling_price || 0).toFixed(2)}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    <span
                      className={
                        margin.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {margin.amount >= 0 ? '+' : ''}
                      {margin.percent.toFixed(1)}%
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <button
                      onClick={() => handleOpenQuantity(item)}
                      className='text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline'
                    >
                      {item.quantity}
                    </button>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-500'>
                    {item.min_stock_level}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        item.stock_status
                      )}`}
                    >
                      {formatStatus(item.stock_status)}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right text-sm space-x-2'>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className='text-blue-600 hover:text-blue-900'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDeleteDialog(true);
                      }}
                      className='text-red-600 hover:text-red-900'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Part Color'
        size='md'
      >
        <form onSubmit={handleEdit}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Part
              </label>
              <select
                value={editData.part_id}
                onChange={(e) =>
                  setEditData({ ...editData, part_id: e.target.value })
                }
                className='input-field'
                required
              >
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
                value={editData.color_id}
                onChange={(e) =>
                  setEditData({ ...editData, color_id: e.target.value })
                }
                className='input-field'
                required
              >
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Purchase Price (CHF)
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={editData.purchase_price}
                  onChange={(e) =>
                    setEditData({ ...editData, purchase_price: e.target.value })
                  }
                  className='input-field'
                  min='0'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Selling Price (CHF)
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={editData.selling_price}
                  onChange={(e) =>
                    setEditData({ ...editData, selling_price: e.target.value })
                  }
                  className='input-field'
                  min='0'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Quantity
                </label>
                <input
                  type='number'
                  value={editData.quantity}
                  onChange={(e) =>
                    setEditData({ ...editData, quantity: e.target.value })
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
                  value={editData.min_stock_level}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      min_stock_level: e.target.value,
                    })
                  }
                  className='input-field'
                  min='0'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Order Number
              </label>
              <input
                type='text'
                value={editData.order_number}
                onChange={(e) =>
                  setEditData({ ...editData, order_number: e.target.value })
                }
                className='input-field'
                placeholder='SKU/Order number'
              />
            </div>

            {/* Margin preview */}
            {editData.purchase_price > 0 && editData.selling_price > 0 && (
              <div className='bg-gray-50 p-3 rounded-lg'>
                <p className='text-sm text-gray-600'>
                  Profit Margin:{' '}
                  <span className='font-semibold text-green-600'>
                    CHF{' '}
                    {(
                      parseFloat(editData.selling_price) -
                      parseFloat(editData.purchase_price)
                    ).toFixed(2)}{' '}
                    (
                    {(
                      ((parseFloat(editData.selling_price) -
                        parseFloat(editData.purchase_price)) /
                        parseFloat(editData.purchase_price)) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </p>
              </div>
            )}

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
        <form onSubmit={handleQuantityUpdate}>
          <div className='space-y-4'>
            <div className='bg-gray-50 p-3 rounded-lg'>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>{selectedItem?.part_name}</span> -{' '}
                {selectedItem?.color_name}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                Current:{' '}
                <span className='font-semibold'>{selectedItem?.quantity}</span>
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Adjustment Type
              </label>
              <select
                value={quantityData.adjustment_type}
                onChange={(e) =>
                  setQuantityData({
                    ...quantityData,
                    adjustment_type: e.target.value,
                  })
                }
                className='input-field'
              >
                <option value='set'>Set to exact value</option>
                <option value='add'>Add to current</option>
                <option value='remove'>Remove from current</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Quantity
              </label>
              <input
                type='number'
                value={quantityData.quantity}
                onChange={(e) =>
                  setQuantityData({ ...quantityData, quantity: e.target.value })
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
              <button type='submit' className='btn-primary'>
                Update
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title='Delete Part Color'
        message={`Are you sure you want to delete "${selectedItem?.part_name} - ${selectedItem?.color_name}"?`}
      />
    </>
  );
};

export default PartsColorsTable;
