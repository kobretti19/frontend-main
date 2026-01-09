import React, { useState } from 'react';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';

const PartsTable = ({ parts, partsCategories, onEdit, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    part_category_id: '',
  });

  const handleEdit = (part) => {
    setSelectedPart(part);
    setFormData({
      name: part.name,
      description: part.description || '',
      purchase_price: part.purchase_price || '',
      selling_price: part.selling_price || '',
      part_category_id: part.part_category_id || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (part) => {
    setSelectedPart(part);
    setShowDeleteDialog(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    onEdit(selectedPart.id, {
      ...formData,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
    });
    setShowEditModal(false);
    setSelectedPart(null);
  };

  const confirmDelete = () => {
    onDelete(selectedPart.id);
    setShowDeleteDialog(false);
    setSelectedPart(null);
  };

  // Calculate profit margin
  const getProfitMargin = (purchase, selling) => {
    const purchasePrice = parseFloat(purchase) || 0;
    const sellingPrice = parseFloat(selling) || 0;
    if (purchasePrice === 0) return 0;
    return (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(1);
  };

  return (
    <>
      <div className='table-container'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                ID
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Purchase Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Selling Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Margin
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {parts.map((part) => {
              const margin = getProfitMargin(
                part.purchase_price,
                part.selling_price
              );
              return (
                <tr key={part.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {part.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-normal text-gray-900'>
                    {part.name}
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {part.category_name || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-xs text-gray-500'>
                    {part.description || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {parseFloat(part.purchase_price || 0).toFixed(2)} CHF
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-green-600 font-normal'>
                    {parseFloat(part.selling_price || 0).toFixed(2)} CHF
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        margin > 20
                          ? 'bg-green-100 text-green-800'
                          : margin > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {margin}%
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                    <button
                      onClick={() => handleEdit(part)}
                      className='text-blue-600 hover:text-blue-900'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(part)}
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

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Part'
        size='md'
      >
        <form onSubmit={handleSubmitEdit}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Part Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='input-field'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='input-field'
                rows='3'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Purchase Price (CHF)
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={formData.purchase_price}
                  onChange={(e) =>
                    setFormData({ ...formData, purchase_price: e.target.value })
                  }
                  className='input-field'
                  placeholder='0.00'
                  min='0'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Selling Price (CHF)
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={formData.selling_price}
                  onChange={(e) =>
                    setFormData({ ...formData, selling_price: e.target.value })
                  }
                  className='input-field'
                  placeholder='0.00'
                  min='0'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Category
              </label>
              <select
                value={formData.part_category_id}
                onChange={(e) =>
                  setFormData({ ...formData, part_category_id: e.target.value })
                }
                className='input-field'
              >
                <option value=''>Select category</option>
                {partsCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex justify-end space-x-3'>
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title='Delete Part'
        message={`Are you sure you want to delete "${selectedPart?.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default PartsTable;