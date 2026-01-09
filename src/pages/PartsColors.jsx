import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPartsColors,
  createPartsColor,
  updatePartsColor,
  deletePartsColor,
  updateQuantity,
  fetchLowStock,
} from '../redux/slices/partsColorsSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import { fetchColors } from '../redux/slices/colorsSlice';
import PartsColorsTable from '../components/Tables/PartsColorsTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

const PartsColors = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();

  const partsColors = useSelector((state) => state.partsColors?.items || []);
  const loading = useSelector((state) => state.partsColors?.loading || false);
  const parts = useSelector((state) => state.parts?.items || []);
  const colors = useSelector((state) => state.colors?.items || []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    part_id: '',
    color_id: '',
    quantity: '0',
    min_stock_level: '5',
    order_number: '',
  });

  const loadData = useCallback(() => {
    dispatch(fetchPartsColors()).catch((err) =>
      console.error('Failed to fetch parts colors:', err)
    );
    dispatch(fetchLowStock()).catch((err) =>
      console.error('Failed to fetch low stock:', err)
    );
  }, [dispatch]);

  useEffect(() => {
    loadData();
    dispatch(fetchParts()).catch((err) =>
      console.error('Failed to fetch parts:', err)
    );
    dispatch(fetchColors()).catch((err) =>
      console.error('Failed to fetch colors:', err)
    );
  }, [loadData, dispatch]);

  // Filter parts colors
  const filteredPartsColors = partsColors.filter((item) => {
    const matchesSearch =
      item.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || item.stock_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.part_id || !formData.color_id) {
      alert('Please select both a part and a color');
      return;
    }

    const dataToSend = {
      part_id: parseInt(formData.part_id),
      color_id: parseInt(formData.color_id),
      quantity: parseInt(formData.quantity) || 0,
      min_stock_level: parseInt(formData.min_stock_level) || 5,
      order_number: formData.order_number || null,
    };

    console.log('Sending data:', dataToSend);

    try {
      await dispatch(createPartsColor(dataToSend)).unwrap();
      setShowCreateModal(false);
      setFormData({
        part_id: '',
        color_id: '',
        quantity: '0',
        min_stock_level: '5',
        order_number: '',
      });
      loadData();
    } catch (err) {
      console.error('Create error:', err);
      alert(`Failed to create: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEdit = async (item, data) => {
    try {
      console.log('Updating item ID:', item.id, 'with data:', data);
      await dispatch(
        updatePartsColor({
          id: item.id,
          data,
        })
      ).unwrap();
      loadData();
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Failed to update: ' + err.message);
    }
  };

  const handleDelete = async (item) => {
    try {
      await dispatch(deletePartsColor(item.id)).unwrap();
      loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleUpdateQuantity = async (item, data) => {
    try {
      await dispatch(
        updateQuantity({
          id: item.id,
          data,
        })
      ).unwrap();
      loadData();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      alert('Failed to update quantity: ' + err.message);
    }
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Parts Colors Inventory
          </h1>
          <p className='text-gray-600 mt-1'>
            Manage parts with colors and quantities
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Add Part Color
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Items</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>
            {partsColors.length}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Low Stock Items</p>
          <p className='text-3xl font-bold text-yellow-600 mt-2'>
            {
              partsColors.filter((item) => item.stock_status === 'low_stock')
                .length
            }
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Out of Stock</p>
          <p className='text-3xl font-bold text-red-600 mt-2'>
            {
              partsColors.filter((item) => item.stock_status === 'out_of_stock')
                .length
            }
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Filtered Results</p>
          <p className='text-3xl font-bold text-purple-600 mt-2'>
            {filteredPartsColors.length}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='input-field'
            >
              <option value=''>All Status</option>
              <option value='in_stock'>In Stock</option>
              <option value='low_stock'>Low Stock</option>
              <option value='out_of_stock'>Out of Stock</option>
            </select>

            {filterStatus && (
              <button
                onClick={() => {
                  setFilterStatus('');
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
      ) : filteredPartsColors.length === 0 ? (
        <div className='card text-center py-12'>
          <div className='text-6xl mb-4'>🎨</div>
          <p className='text-xl font-semibold text-gray-900 mb-2'>
            {partsColors.length === 0
              ? 'No Parts Colors Found'
              : 'No Results Found'}
          </p>
          <p className='text-gray-500 mb-6'>
            {partsColors.length === 0
              ? 'Start by adding colors to your parts with initial quantities'
              : 'Try adjusting your search or filters'}
          </p>
          {partsColors.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className='btn-primary'
            >
              + Add Part Color
            </button>
          )}
        </div>
      ) : (
        <PartsColorsTable
          partsColors={filteredPartsColors}
          parts={parts}
          colors={colors}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateQuantity={handleUpdateQuantity}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Add Part Color'
        size='md'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Part *
              </label>
              <select
                value={formData.part_id}
                onChange={(e) =>
                  setFormData({ ...formData, part_id: e.target.value })
                }
                className='input-field'
                required
              >
                <option value=''>Select part</option>
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} - Purchase: {part.purchase_price || 0} CHF /
                    Sell: {part.selling_price || 0} CHF
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Color *
              </label>
              <select
                value={formData.color_id}
                onChange={(e) =>
                  setFormData({ ...formData, color_id: e.target.value })
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
                Initial Quantity *
              </label>
              <input
                type='number'
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className='input-field'
                placeholder='0'
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
                value={formData.min_stock_level}
                onChange={(e) =>
                  setFormData({ ...formData, min_stock_level: e.target.value })
                }
                className='input-field'
                placeholder='5'
                min='0'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Order Number (Optional)
              </label>
              <input
                type='text'
                value={formData.order_number}
                onChange={(e) =>
                  setFormData({ ...formData, order_number: e.target.value })
                }
                className='input-field'
                placeholder='Enter order number'
              />
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowCreateModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Add Part Color
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartsColors;
