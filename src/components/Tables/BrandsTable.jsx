import React, { useState } from 'react';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';

const BrandsTable = ({ brands, onEdit, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setFormData({ name: brand.name });
    setShowEditModal(true);
  };

  const handleDelete = (brand) => {
    setSelectedBrand(brand);
    setShowDeleteDialog(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    onEdit(selectedBrand.id, formData);
    setShowEditModal(false);
    setSelectedBrand(null);
  };

  const confirmDelete = () => {
    onDelete(selectedBrand.id);
    setShowDeleteDialog(false);
    setSelectedBrand(null);
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
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {brands.map((brand) => (
              <tr key={brand.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {brand.id}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {brand.name}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                  <button
                    onClick={() => handleEdit(brand)}
                    className='text-blue-600 hover:text-blue-900'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(brand)}
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

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Brand'
        size='sm'
      >
        <form onSubmit={handleSubmitEdit}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Brand Name
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className='input-field'
                required
              />
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
        title='Delete Brand'
        message={`Are you sure you want to delete "${selectedBrand?.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default BrandsTable;
