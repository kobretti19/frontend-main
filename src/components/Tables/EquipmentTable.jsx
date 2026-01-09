import React, { useState } from 'react';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';

const EquipmentTable = ({
  equipment,
  onEdit,
  onDelete,
  onViewDetails,
  onSaveAsTemplate,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    serial_number: '',
  });


console.log(formData,"formData")

  const handleEdit = (item) => {
    setSelectedEquipment(item);
    setFormData({
      model: item.model || '',
      serial_number: item.serial_number || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedEquipment(item);
    setShowDeleteDialog(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    onEdit(selectedEquipment.id, formData);
    setShowEditModal(false);
    setSelectedEquipment(null);
  };

  const confirmDelete = () => {
    onDelete(selectedEquipment.id);
    setShowDeleteDialog(false);
    setSelectedEquipment(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get display name for created by
  const getCreatedByDisplay = (item) => {
    if (item.created_by_name && item.created_by_name.trim()) {
      return item.created_by_name;
    }
    if (item.created_by_username && item.created_by_username.trim()) {
      return item.created_by_username;
    }
    return 'Unknown';
  };

  // Helper function to get initials
  const getInitials = (item) => {
    const name = getCreatedByDisplay(item);
    if (name === 'Unknown') return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className='table-container'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Model
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Serial Number
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Brand
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Created By
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date Created
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {equipment.map((item) => (
              <tr key={item.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {item.model}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {item.serial_number || '-'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {item.category_name || '-'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {item.brand_name || '-'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                  <div className='flex items-center'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        getCreatedByDisplay(item) === 'Unknown'
                          ? 'bg-gray-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <span
                        className={`font-semibold text-xs ${
                          getCreatedByDisplay(item) === 'Unknown'
                            ? 'text-gray-400'
                            : 'text-blue-600'
                        }`}
                      >
                        {getInitials(item)}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          getCreatedByDisplay(item) === 'Unknown'
                            ? 'text-gray-400 italic'
                            : ''
                        }`}
                      >
                        {getCreatedByDisplay(item)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(item.created_at)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                  <button
                    onClick={() => onViewDetails(item)}
                    className='text-purple-600 hover:text-purple-900'
                  >
                    View
                  </button>
                  {onSaveAsTemplate && (
                    <button
                      onClick={() => onSaveAsTemplate(item)}
                      className='text-green-600 hover:text-green-900'
                      title='Save as Template'
                    >
                      💾 Template
                    </button>
                  )}
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

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Equipment'
        size='md'
      >
        <form onSubmit={handleSubmitEdit}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Model Name
              </label>
              <input
                type='text'
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className='input-field'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Serial Number (Optional)
              </label>
              <input
                type='text'
                value={formData.serial_number}
                onChange={(e) =>
                  setFormData({ ...formData, serial_number: e.target.value })
                }
                className='input-field'
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title='Delete Equipment'
        message={`Are you sure you want to delete "${selectedEquipment?.model}"? This action cannot be undone.`}
      />
    </>
  );
};

export default EquipmentTable;
