import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchParts,
  fetchColors,
  fetchCategories,
  fetchSuppliers,
  createPart,
  updatePart,
  deletePart,
} from '../redux/slices/partsSlice';
import PartsTable from '../components/Tables/PartsTable';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

const Parts = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();
  const {
    items: parts,
    colors,
    categories,
    suppliers,
    loading,
    error,
  } = useSelector((state) => state.parts);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '',
    category: '',
    supplier: '',
    sku: '',
    article_id: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    min_stock_level: '5',
  });

  useEffect(() => {
    dispatch(fetchParts());
    dispatch(fetchColors());
    dispatch(fetchCategories());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  // Filter parts
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filterCategory || part.category === filterCategory;
    const matchesColor = !filterColor || part.color === filterColor;
    const matchesSupplier = !filterSupplier || part.supplier === filterSupplier;

    return matchesSearch && matchesCategory && matchesColor && matchesSupplier;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      min_stock_level: parseInt(formData.min_stock_level) || 5,
    };
    dispatch(createPart(dataToSend))
      .unwrap()
      .then(() => {
        setShowCreateModal(false);
        resetForm();
        // Refresh dropdown options
        dispatch(fetchColors());
        dispatch(fetchCategories());
        dispatch(fetchSuppliers());
      })
      .catch((err) => console.error('Failed to create part:', err));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '',
      category: '',
      supplier: '',
      sku: '',
      article_id: '',
      purchase_price: '',
      selling_price: '',
      quantity: '',
      min_stock_level: '5',
    });
  };

  const handleEdit = (id, data) => {
    dispatch(updatePart({ id, data }))
      .unwrap()
      .then(() => {
        // Refresh dropdown options in case new values were added
        dispatch(fetchColors());
        dispatch(fetchCategories());
        dispatch(fetchSuppliers());
      })
      .catch((err) => console.error('Failed to update part:', err));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      dispatch(deletePart(id)).catch((err) =>
        console.error('Failed to delete part:', err),
      );
    }
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterColor('');
    setFilterSupplier('');
  };

  const hasActiveFilters = filterCategory || filterColor || filterSupplier;

  // Calculate stats
  const lowStockCount = parts.filter(
    (p) => p.quantity <= p.min_stock_level,
  ).length;
  const totalValue = parts.reduce(
    (sum, p) => sum + p.quantity * p.purchase_price,
    0,
  );

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
            Manage your equipment parts, pricing and inventory
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
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Parts</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>
            {parts.length}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Low Stock</p>
          <p className='text-3xl font-bold text-red-600 mt-2'>
            {lowStockCount}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Value</p>
          <p className='text-3xl font-bold text-green-600 mt-2'>
            CHF {totalValue.toFixed(2)}
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

          <div className='flex  items-center gap-3 font-xs'>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className='input-field w-auto'
            >
              <option value=''>All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className='input-field'
            >
              <option value=''>All Colors</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className='input-field w-auto'
            >
              <option value=''>All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Part'
        size='lg'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-4'>
            {/* Row 1: Name & SKU */}
            <div className='grid grid-cols-2 gap-4'>
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
                  SKU / Order Number
                </label>
                <input
                  type='text'
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className='input-field'
                  placeholder='e.g., FP-BLK-001'
                />
              </div>
            </div>

            {/* Row 2: Color, Category, Supplier */}
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Color
                </label>
                <input
                  type='text'
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className='input-field'
                  placeholder='e.g., Black'
                  list='colors-list'
                />
                <datalist id='colors-list'>
                  {colors.map((color) => (
                    <option key={color} value={color} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Category
                </label>
                <input
                  type='text'
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className='input-field'
                  placeholder='e.g., Panels'
                  list='categories-list'
                />
                <datalist id='categories-list'>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Supplier
                </label>
                <input
                  type='text'
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  className='input-field'
                  placeholder='e.g., ABC GmbH'
                  list='suppliers-list'
                />
                <datalist id='suppliers-list'>
                  {suppliers.map((supplier) => (
                    <option key={supplier} value={supplier} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Row 3: Article ID */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Article ID (External Reference)
              </label>
              <input
                type='text'
                value={formData.article_id}
                onChange={(e) =>
                  setFormData({ ...formData, article_id: e.target.value })
                }
                className='input-field'
                placeholder='e.g., ART-1001'
              />
            </div>

            {/* Row 4: Description */}
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
                rows='2'
              />
            </div>

            {/* Row 5: Prices */}
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

            {/* Row 6: Quantity & Min Stock */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Initial Quantity
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
                    setFormData({
                      ...formData,
                      min_stock_level: e.target.value,
                    })
                  }
                  className='input-field'
                  placeholder='5'
                  min='0'
                />
              </div>
            </div>

            {/* Buttons */}
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
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
