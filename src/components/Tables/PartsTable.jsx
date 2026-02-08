import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../Common/Modal';
import ConfirmDialog from '../Common/ConfirmDialog';
import { useEntityDetails } from '../UI';

const PartsTable = ({ parts, onEdit, onDelete }) => {
  const { openPart } = useEntityDetails();
  const { colors, categories, suppliers } = useSelector((state) => state.parts);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
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
    min_stock_level: '',
  });

  const handleEdit = (part) => {
    setSelectedPart(part);
    setFormData({
      name: part.name || '',
      description: part.description || '',
      color: part.color || '',
      category: part.category || '',
      supplier: part.supplier || '',
      sku: part.sku || '',
      article_id: part.article_id || '',
      purchase_price: part.purchase_price || '',
      selling_price: part.selling_price || '',
      quantity: part.quantity || 0,
      min_stock_level: part.min_stock_level || 5,
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
      quantity: parseInt(formData.quantity) || 0,
      min_stock_level: parseInt(formData.min_stock_level) || 5,
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

  // Get stock status
  const getStockStatus = (quantity, minLevel) => {
    const qty = parseInt(quantity) || 0;
    const min = parseInt(minLevel) || 5;
    if (qty === 0)
      return { label: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    if (qty <= min)
      return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', class: 'bg-green-100 text-green-800' };
  };

  return (
    <>
      <div className='table-container overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Part
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Color
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Category
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Supplier
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                SKU
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Stock
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Purchase
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Selling
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Margin
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {parts.map((part) => {
              const margin = getProfitMargin(
                part.purchase_price,
                part.selling_price,
              );
              const stockStatus = getStockStatus(
                part.quantity,
                part.min_stock_level,
              );

              return (
                <tr key={part.id} className='hover:bg-gray-50'>
                  {/* Part Name & Description */}
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <button
                      onClick={() => openPart(part.id, part)}
                      className='font-medium text-blue-600 hover:text-blue-800 hover:underline'
                    >
                      {part.name}
                    </button>
                    {part.description && (
                      <p className='text-xs text-gray-500 truncate max-w-xs'>
                        {part.description}
                      </p>
                    )}
                  </td>

                  {/* Color */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm'>
                    {part.color ? (
                      <span className='px-2 py-1 bg-gray-100 rounded text-gray-700'>
                        {part.color}
                      </span>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-700'>
                    {part.category || <span className='text-gray-400'>-</span>}
                  </td>

                  {/* Supplier */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-700'>
                    {part.supplier || <span className='text-gray-400'>-</span>}
                  </td>

                  {/* SKU */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono'>
                    {part.sku || <span className='text-gray-400'>-</span>}
                  </td>

                  {/* Stock */}
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium text-gray-900'>
                        {part.quantity || 0}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full w-fit ${stockStatus.class}`}
                      >
                        {stockStatus.label}
                      </span>
                    </div>
                  </td>

                  {/* Purchase Price */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {parseFloat(part.purchase_price || 0).toFixed(2)} CHF
                  </td>

                  {/* Selling Price */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium'>
                    {parseFloat(part.selling_price || 0).toFixed(2)} CHF
                  </td>

                  {/* Margin */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm'>
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

                  {/* Actions */}
                  <td className='px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
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

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Part'
        size='lg'
      >
        <form onSubmit={handleSubmitEdit}>
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
                  list='edit-colors-list'
                />
                <datalist id='edit-colors-list'>
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
                  list='edit-categories-list'
                />
                <datalist id='edit-categories-list'>
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
                  list='edit-suppliers-list'
                />
                <datalist id='edit-suppliers-list'>
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
                  min='0'
                />
              </div>
            </div>

            {/* Row 6: Quantity & Min Stock */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Quantity
                </label>
                <input
                  type='number'
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className='input-field'
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
                  min='0'
                />
              </div>
            </div>

            {/* Buttons */}
            <div className='flex justify-end space-x-3 pt-4'>
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
