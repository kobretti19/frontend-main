import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPartsCategories,
  createPartsCategory,
  updatePartsCategory,
  deletePartsCategory,
} from '../redux/slices/partsCategoriesSlice';
import PartsCategoriesTable from '../components/Tables/PartsCategoriesTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const PartsCategories = () => {
  const dispatch = useDispatch();
  const partsCategories = useSelector(
    (state) => state.partsCategories?.items || []
  );
  const loading = useSelector(
    (state) => state.partsCategories?.loading || false
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    dispatch(fetchPartsCategories()).catch((err) =>
      console.error('Failed to fetch parts categories:', err)
    );
  }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createPartsCategory(formData))
      .then(() => {
        setShowCreateModal(false);
        setFormData({ name: '', description: '' });
      })
      .catch((err) => console.error('Failed to create category:', err));
  };

  const handleEdit = (id, data) => {
    dispatch(updatePartsCategory({ id, data })).catch((err) =>
      console.error('Failed to update:', err)
    );
  };

  const handleDelete = (id) => {
    dispatch(deletePartsCategory(id)).catch((err) =>
      console.error('Failed to delete:', err)
    );
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Parts Categories</h1>
          <p className='text-gray-600 mt-1'>
            Organize your parts into categories
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Add Parts Category
        </button>
      </div>

      {/* Info Card */}
      <div className='card mb-6 bg-blue-50 border border-blue-200'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <svg
              className='h-6 w-6 text-blue-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <div className='ml-3 flex-1'>
            <h3 className='text-sm font-medium text-blue-800'>
              Parts Categories
            </h3>
            <div className='mt-2 text-sm text-blue-700'>
              <p>
                Parts categories help you organize your parts inventory.
                Examples: Panels, Profiles, Covers, Hardware, Electronics, etc.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Categories</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>
            {partsCategories.length}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Most Recent</p>
          <p className='text-lg font-semibold text-gray-900 mt-2'>
            {partsCategories.length > 0
              ? partsCategories[partsCategories.length - 1].name
              : 'None'}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Quick Action</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary mt-2 w-full'
          >
            Add New Category
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : partsCategories.length === 0 ? (
        <div className='card text-center py-12'>
          <div className='text-6xl mb-4'>📑</div>
          <p className='text-xl font-semibold text-gray-900 mb-2'>
            No Parts Categories Yet
          </p>
          <p className='text-gray-500 mb-6'>
            Create your first parts category to organize your inventory
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary'
          >
            + Add Parts Category
          </button>

          {/* Example categories */}
          <div className='mt-8 text-left max-w-md mx-auto'>
            <p className='text-sm font-medium text-gray-700 mb-3'>
              Suggested categories:
            </p>
            <div className='space-y-2'>
              {[
                'Panels',
                'Profiles',
                'Covers',
                'Hardware',
                'Electronics',
                'Fasteners',
              ].map((cat) => (
                <div
                  key={cat}
                  className='flex items-center text-sm text-gray-600'
                >
                  <svg
                    className='w-4 h-4 mr-2 text-gray-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <PartsCategoriesTable
          partsCategories={partsCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Parts Category'
        size='md'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Category Name *
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='input-field'
                placeholder='e.g., Panels, Profiles, Covers'
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
                placeholder='Describe what parts belong in this category'
                rows='3'
              />
            </div>

            {/* Helpful hints */}
            <div className='bg-gray-50 p-3 rounded-lg'>
              <p className='text-xs font-medium text-gray-700 mb-2'>💡 Tips:</p>
              <ul className='text-xs text-gray-600 space-y-1'>
                <li>• Use clear, descriptive names</li>
                <li>• Keep categories broad enough to be useful</li>
                <li>• You can always add more later</li>
              </ul>
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
                Create Category
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartsCategories;
