import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../redux/slices/brandsSlice';
import BrandsTable from '../components/Tables/BrandsTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Brands = () => {
  const dispatch = useDispatch();
  const { items: brands, loading } = useSelector((state) => state.brands);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createBrand(formData));
    setShowCreateModal(false);
    setFormData({ name: '' });
  };

  const handleEdit = (id, data) => {
    dispatch(updateBrand({ id, data }));
  };

  const handleDelete = (id) => {
    dispatch(deleteBrand(id));
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Brands</h1>
          <p className='text-gray-600 mt-1'>Manage your product brands</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Add Brand
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : brands.length === 0 ? (
        <div className='card text-center py-12'>
          <p className='text-gray-500 mb-4'>
            No brands found. Create your first brand!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className='btn-primary'
          >
            + Add Brand
          </button>
        </div>
      ) : (
        <BrandsTable
          brands={brands}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Brand'
        size='sm'
      >
        <form onSubmit={handleCreate}>
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
                placeholder='Enter brand name'
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
                Create Brand
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Brands;
