import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../redux/slices/categoriesSlice';
import CategoriesTable from '../components/Tables/CategoriesTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Categories = () => {
  const dispatch = useDispatch();
  const { items: categories, loading } = useSelector(
    (state) => state.categories
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createCategory(formData));
    setShowCreateModal(false);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (id, data) => {
    dispatch(updateCategory({ id, data }));
  };

  const handleDelete = (id) => {
    dispatch(deleteCategory(id));
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Categories</h1>
          <p className='text-gray-600 mt-1'>Manage your equipment categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <div className='card text-center py-12'>
          <p className='text-gray-500 mb-4'>
            No categories found. Create your first category!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary'
          >
            + Add Category
          </button>
        </div>
      ) : (
        <CategoriesTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Category'
        size='md'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Category Name
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='input-field'
                placeholder='Enter category name'
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
                placeholder='Enter category description'
                rows='3'
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
                Create Category
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
