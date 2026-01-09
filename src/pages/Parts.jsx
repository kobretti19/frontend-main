import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchParts,
  createPart,
  updatePart,
  deletePart,
} from '../redux/slices/partsSlice';
import { fetchPartsCategories } from '../redux/slices/partsCategoriesSlice';
import PartsTable from '../components/Tables/PartsTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

const Parts = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();
  const { items: parts, loading, error } = useSelector((state) => state.parts);
  const { items: partsCategories } = useSelector(
    (state) => state.partsCategories
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchase_price: '',
    selling_price: '',
    part_category_id: '',
  });

  useEffect(() => {
    dispatch(fetchParts()).catch((err) =>
      console.error('Failed to fetch parts:', err)
    );
    dispatch(fetchPartsCategories()).catch((err) =>
      console.error('Failed to fetch categories:', err)
    );
  }, [dispatch]);

  // Filter parts
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !filterCategory || part.part_category_id?.toString() === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
    };
    dispatch(createPart(dataToSend))
      .then(() => {
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          purchase_price: '',
          selling_price: '',
          part_category_id: '',
        });
      })
      .catch((err) => console.error('Failed to create part:', err));
  };

  const handleEdit = (id, data) => {
    dispatch(updatePart({ id, data })).catch((err) =>
      console.error('Failed to update part:', err)
    );
  };

  const handleDelete = (id) => {
    dispatch(deletePart(id)).catch((err) =>
      console.error('Failed to delete part:', err)
    );
  };

  if (error) {
    return (
      <div>
        <h1 className='text-3xl font-bold text-gray-900 mb-6'>Parts</h1>
        <div className='card bg-red-50 border border-red-200'>
          <p className='text-red-600'>Error loading parts: {error}</p>
          <button
            onClick={() => dispatch(fetchParts())}
            className='btn-primary mt-4'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Parts</h1>
          <p className='text-gray-600 mt-1'>
            Manage your equipment parts and pricing
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Add Part
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Parts</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>
            {parts.length}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Categories</p>
          <p className='text-3xl font-bold text-blue-600 mt-2'>
            {partsCategories.length}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Filtered Results</p>
          <p className='text-3xl font-bold text-purple-600 mt-2'>
            {filteredParts.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='card mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4'>
          <div className='flex-1'>
            {searchTerm && (
              <p className='text-sm text-gray-600'>
                Searching for:{' '}
                <span className='font-medium text-gray-900'>
                  "{searchTerm}"
                </span>
              </p>
            )}
          </div>

          <div className='flex items-center space-x-3'>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className='input-field'
            >
              <option value=''>All Categories</option>
              {partsCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {filterCategory && (
              <button
                onClick={() => {
                  setFilterCategory('');
                }}
                className='btn-secondary whitespace-nowrap'
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredParts.length === 0 ? (
        <div className='card text-center py-12'>
          <div className='text-6xl mb-4'>🔩</div>
          <p className='text-xl font-semibold text-gray-900 mb-2'>
            {parts.length === 0 ? 'No Parts Yet' : 'No Results Found'}
          </p>
          <p className='text-gray-500 mb-6'>
            {parts.length === 0
              ? 'Create your first part to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {parts.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className='btn-primary'
            >
              + Add Part
            </button>
          )}
        </div>
      ) : (
        <PartsTable
          parts={filteredParts}
          partsCategories={partsCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Part'
        size='md'
      >
        <form onSubmit={handleCreate}>
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
                placeholder='Enter part name'
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
                placeholder='Enter description'
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
                <option value=''>Select category (optional)</option>
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
                onClick={() => setShowCreateModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Create Part
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Parts;
