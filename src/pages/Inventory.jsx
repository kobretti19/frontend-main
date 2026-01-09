import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {
  fetchPartsColors,
  fetchLowStock,
  updateQuantity,
} from '../redux/slices/partsColorsSlice';
import { fetchEquipment } from '../redux/slices/equipmentSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import {
  fetchTransactions,
  createTransaction,
} from '../redux/slices/inventorySlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Modal from '../components/Common/Modal';
import InventoryTransactionsTable from '../components/Tables/InventoryTransactionsTable';
import { Link } from 'react-router-dom';

const Inventory = () => {
  const dispatch = useDispatch();

  const partsColors = useSelector((state) => state.partsColors?.items || []);
  const lowStock = useSelector((state) => state.partsColors?.lowStock || []);
  const equipment = useSelector((state) => state.equipment?.items || []);
  const transactions = useSelector(
    (state) => state.inventory?.transactions || []
  );

  const loading = useSelector((state) => state.partsColors?.loading || false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [adjustmentData, setAdjustmentData] = useState({
    quantity: '',
    adjustment_type: 'add',
    transaction_type: 'adjustment',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchPartsColors()).catch((err) => console.error('Failed:', err));
    dispatch(fetchLowStock()).catch((err) => console.error('Failed:', err));
    dispatch(fetchEquipment()).catch((err) => console.error('Failed:', err));
    dispatch(fetchParts()).catch((err) => console.error('Failed:', err));
    dispatch(fetchTransactions()).catch((err) => console.error('Failed:', err));
  }, [dispatch]);

  /* -------------------- Helpers -------------------- */

  const totalValue = partsColors.reduce(
    (sum, i) => sum + i.quantity * (parseFloat(i.price) || 0),
    0
  );

  const totalItems = partsColors.reduce(
    (sum, i) => sum + (parseInt(i.quantity) || 0),
    0
  );

  const outOfStock = partsColors.filter(
    (i) => i.stock_status === 'out_of_stock'
  ).length;

  const filteredInventory = partsColors.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.part_name?.toLowerCase().includes(term) ||
      item.color_name?.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term);

    const matchesStatus =
      filterStatus === 'all' || item.stock_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'in_stock':
        return '✓';
      case 'low_stock':
        return '⚠';
      case 'out_of_stock':
        return '✕';
      default:
        return '?';
    }
  };

  /* -------------------- Actions -------------------- */

  const handleAdjustQuantity = (item) => {
    setSelectedItem(item);
    setAdjustmentData({
      quantity: '',
      adjustment_type: 'add',
      transaction_type: 'adjustment',
      notes: '',
    });
    setShowAdjustModal(true);
  };

  const handleSubmitAdjustment = (e) => {
    e.preventDefault();

    dispatch(
      updateQuantity({
        id: selectedItem.id,
        data: {
          quantity: adjustmentData.quantity,
          adjustment_type: adjustmentData.adjustment_type,
        },
      })
    )
      .then(() => {
        const qty = parseInt(adjustmentData.quantity);
        const before = parseInt(selectedItem.quantity);

        let after;
        if (adjustmentData.adjustment_type === 'add') {
          after = before + qty;
        } else if (adjustmentData.adjustment_type === 'remove') {
          after = before - qty;
        } else {
          after = qty; // set
        }

        dispatch(
          createTransaction({
            part_color_id: selectedItem.id,
            transaction_type: adjustmentData.transaction_type,
            quantity_change: after - before,
            quantity_before: before,
            quantity_after: after,
            notes: adjustmentData.notes,
          })
        );

        setShowAdjustModal(false);
        setSelectedItem(null);
      })
      .catch((err) => console.error('Adjustment failed:', err));
  };

  /* ==================== RENDER ==================== */

  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-900 mb-2'>
        Inventory Management
      </h1>
      <p className='text-gray-600 mb-6'>
        Monitor and manage your parts inventory
      </p>

      {/* Tabs */}
      <div className='border-b border-gray-200 mb-6'>
        <nav className='flex space-x-8'>
          {['overview', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview'
                ? '📊 Overview'
                : `📝 Transactions (${transactions.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* ================= OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='card hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Total SKUs
                  </p>
                  <p className='text-3xl font-bold text-gray-900 mt-2'>
                    {partsColors.length}
                  </p>
                </div>
                <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl'>
                  📦
                </div>
              </div>
            </div>
            <div className='card hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Total Items
                  </p>
                  <p className='text-3xl font-bold text-blue-600 mt-2'>
                    {totalItems}
                  </p>
                </div>
                <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl'>
                  📊
                </div>
              </div>
            </div>
            <div className='card hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Low Stock</p>
                  <p className='text-3xl font-bold text-yellow-600 mt-2'>
                    {lowStock.length}
                  </p>
                </div>
                <div className='w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-2xl'>
                  ⚠️
                </div>
              </div>
            </div>
            <div className='card hover:shadow-lg transition-shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Out of Stock
                  </p>
                  <p className='text-3xl font-bold text-red-600 mt-2'>
                    {outOfStock}
                  </p>
                </div>
                <div className='w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-2xl'>
                  🚨
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='card mb-6'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4'>
              <div className='flex-1 max-w-lg'>
                <div className='relative'>
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Search by part, color, or SKU...'
                    className='input-field pl-10'
                  />
                  <svg
                    className='absolute left-3 top-3 h-5 w-5 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className='input-field'
                >
                  <option value='all'>All Status</option>
                  <option value='in_stock'>In Stock</option>
                  <option value='low_stock'>Low Stock</option>
                  <option value='out_of_stock'>Out of Stock</option>
                </select>
                <Link
                  to='/parts-colors'
                  className='btn-primary whitespace-nowrap'
                >
                  + Add Item
                </Link>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredInventory.length === 0 ? (
            <div className='card text-center py-12'>
              <div className='text-6xl mb-4'>📦</div>
              <p className='text-xl font-semibold text-gray-900 mb-2'>
                No items found
              </p>
              <p className='text-gray-500 mb-6'>
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding parts and colors to your inventory'}
              </p>
            </div>
          ) : (
            <div className='card'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Inventory Items ({filteredInventory.length})
                </h2>
                <div className='text-sm text-gray-600'>
                  Total Value:{' '}
                  <span className='font-bold text-gray-900'>
                    {totalValue.toFixed(2)} CHF
                  </span>
                </div>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Part
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Color
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        SKU
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Qty
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Min
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredInventory.map((item) => (
                      <tr
                        key={item.id}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {item.part_name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {item.color_name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono'>
                          {item.sku || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm'>
                          <button
                            onClick={() => handleAdjustQuantity(item)}
                            className='text-blue-600 hover:text-blue-900 font-bold'
                          >
                            {item.quantity}
                          </button>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {item.min_stock_level}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(
                              item.stock_status
                            )}`}
                          >
                            {getStockIcon(item.stock_status)}{' '}
                            {item.stock_status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                          <button
                            onClick={() => handleAdjustQuantity(item)}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Stats Footer */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
            <div className='card bg-gradient-to-br from-blue-50 to-blue-100'>
              <h3 className='text-sm font-medium text-blue-800 mb-2'>
                Equipment Created
              </h3>
              <p className='text-3xl font-bold text-blue-900'>
                {equipment.length}
              </p>
              <Link
                to='/equipment'
                className='text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block'
              >
                View Equipment →
              </Link>
            </div>
            <div className='card bg-gradient-to-br from-green-50 to-green-100'>
              <h3 className='text-sm font-medium text-green-800 mb-2'>
                Parts in Stock
              </h3>
              <p className='text-3xl font-bold text-green-900'>
                {
                  partsColors.filter((i) => i.stock_status === 'in_stock')
                    .length
                }
              </p>
              <p className='text-sm text-green-600 mt-2'>
                {partsColors.length > 0
                  ? (
                      (partsColors.filter((i) => i.stock_status === 'in_stock')
                        .length /
                        partsColors.length) *
                      100
                    ).toFixed(1)
                  : 0}
                % of total
              </p>
            </div>
            <div className='card bg-gradient-to-br from-purple-50 to-purple-100'>
              <h3 className='text-sm font-medium text-purple-800 mb-2'>
                Total Inventory Value
              </h3>
              <p className='text-3xl font-bold text-purple-900'>
                {totalValue.toFixed(2)} CHF
              </p>
              <p className='text-sm text-purple-600 mt-2'>
                Across {partsColors.length} SKUs
              </p>
            </div>
          </div>
        </>
      )}

      {/* ================= TRANSACTIONS ================= */}
      {activeTab === 'transactions' && (
        <div>
          <div className='card mb-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Transaction History
                </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  Complete history of all inventory movements
                </p>
              </div>
              <div className='text-sm text-gray-600'>
                Total:{' '}
                <span className='font-bold text-gray-900'>
                  {transactions.length}
                </span>
              </div>
            </div>
          </div>
          <InventoryTransactionsTable transactions={transactions} />
        </div>
      )}

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title='Adjust Inventory Quantity'
        size='md'
      >
        <form onSubmit={handleSubmitAdjustment} className='space-y-4'>
          {selectedItem && (
            <div className='bg-gray-50 p-4 rounded-lg mb-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Part</p>
                  <p className='font-semibold text-gray-900'>
                    {selectedItem.part_name}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Color</p>
                  <p className='font-semibold text-gray-900'>
                    {selectedItem.color_name}
                  </p>
                </div>
              </div>
              <div className='mt-3 pt-3 border-t border-gray-200'>
                <p className='text-sm text-gray-600'>Current Quantity</p>
                <p className='text-3xl font-bold text-gray-900'>
                  {selectedItem.quantity}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Transaction Type
            </label>
            <select
              value={adjustmentData.transaction_type}
              onChange={(e) =>
                setAdjustmentData({
                  ...adjustmentData,
                  transaction_type: e.target.value,
                })
              }
              className='input-field'
            >
              <option value='adjustment'>Adjustment</option>
              <option value='purchase'>Purchase</option>
              <option value='production'>Production</option>
              <option value='damage'>Damage/Loss</option>
              <option value='return'>Return</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Adjustment Type
            </label>
            <select
              value={adjustmentData.adjustment_type}
              onChange={(e) =>
                setAdjustmentData({
                  ...adjustmentData,
                  adjustment_type: e.target.value,
                })
              }
              className='input-field'
            >
              <option value='add'>Add to Stock</option>
              <option value='set'>Set Exact Amount</option>
              <option value='remove'>Remove from Stock</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              {adjustmentData.adjustment_type === 'add'
                ? 'Quantity to Add'
                : adjustmentData.adjustment_type === 'remove'
                ? 'Quantity to Remove'
                : 'New Total Quantity'}
            </label>
            <input
              type='number'
              min='0'
              required
              value={adjustmentData.quantity}
              onChange={(e) =>
                setAdjustmentData({
                  ...adjustmentData,
                  quantity: e.target.value,
                })
              }
              className='input-field'
              placeholder='Enter quantity'
            />
            {adjustmentData.quantity &&
              selectedItem &&
              adjustmentData.adjustment_type === 'add' && (
                <p className='mt-2 text-sm text-green-600'>
                  New total:{' '}
                  {parseInt(selectedItem.quantity) +
                    parseInt(adjustmentData.quantity)}
                </p>
              )}
            {adjustmentData.quantity &&
              selectedItem &&
              adjustmentData.adjustment_type === 'remove' && (
                <p className='mt-2 text-sm text-red-600'>
                  New total:{' '}
                  {Math.max(
                    0,
                    parseInt(selectedItem.quantity) -
                      parseInt(adjustmentData.quantity)
                  )}
                </p>
              )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Notes *
            </label>
            <textarea
              required
              rows='3'
              className='input-field'
              placeholder='e.g., Received new stock, Inventory correction, Used for production'
              value={adjustmentData.notes}
              onChange={(e) =>
                setAdjustmentData({
                  ...adjustmentData,
                  notes: e.target.value,
                })
              }
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={() => setShowAdjustModal(false)}
              className='btn-secondary'
            >
              Cancel
            </button>
            <button type='submit' className='btn-success'>
              Update Quantity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
