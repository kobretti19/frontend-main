import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchColors,
  createColor,
  updateColor,
  deleteColor,
} from '../redux/slices/colorsSlice';
import ColorsTable from '../components/Tables/ColorsTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Colors = () => {
  const dispatch = useDispatch();
  const { items: colors, loading } = useSelector((state) => state.colors);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    dispatch(fetchColors());
  }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createColor(formData));
    setShowCreateModal(false);
    setFormData({ name: '' });
  };

  const handleEdit = (id, data) => {
    dispatch(updateColor({ id, data }));
  };

  const handleDelete = (id) => {
    dispatch(deleteColor(id));
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Colors</h1>
          <p className='text-gray-600 mt-1'>
            Manage available colors for parts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Add Color
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : colors.length === 0 ? (
        <div className='card text-center py-12'>
          <p className='text-gray-500 mb-4'>
            No colors found. Create your first color!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary'
          >
            + Add Color
          </button>
        </div>
      ) : (
        <ColorsTable
          colors={colors}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Color'
        size='sm'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Color Name
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className='input-field'
                placeholder='Enter color name (e.g., Silver, Black)'
                required
              />
            </div>
            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={() => setShowCreateModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Create Color
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Colors;
