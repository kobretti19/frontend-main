import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStockMovements,
  fetchStockLevels,
  fetchStockAlerts,
  addStock,
  adjustStock,
} from '../redux/slices/stockSlice';
import { fetchPartsColors } from '../redux/slices/partsColorsSlice';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

const StockMovements = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();

  const movements = useSelector((state) => state.stock?.movements || []);
  const levels = useSelector((state) => state.stock?.levels || []);
  const alerts = useSelector((state) => state.stock?.alerts || []);
  const loading = useSelector((state) => state.stock?.loading || false);
  const partsColors = useSelector((state) => state.partsColors?.items || []);

  const [activeTab, setActiveTab] = useState('movements');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  console.log(partsColors, 'partsColors');

  const [addStockData, setAddStockData] = useState({
    part_color_id: '',
    quantity: '',
    notes: '',
  });

  const [adjustStockData, setAdjustStockData] = useState({
    part_color_id: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchStockMovements());
    dispatch(fetchStockLevels());
    dispatch(fetchStockAlerts());
    dispatch(fetchPartsColors());
  }, [dispatch]);

  // Filter movements
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.color_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user_username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      movement.order_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || movement.movement_type === filterType;

    return matchesSearch && matchesType;
  });

  // Filter levels
  const filteredLevels = levels.filter((level) => {
    const matchesSearch =
      level.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.color_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || level.stock_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    return (
      alert.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.color_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addStock(addStockData)).unwrap();
      setShowAddStockModal(false);
      setAddStockData({ part_color_id: '', quantity: '', notes: '' });
      dispatch(fetchStockMovements());
      dispatch(fetchStockLevels());
      dispatch(fetchStockAlerts());
      dispatch(fetchPartsColors());
    } catch (err) {
      alert(`Failed to add stock: ${err.message || 'Unknown error'}`);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      await dispatch(adjustStock(adjustStockData)).unwrap();
      setShowAdjustStockModal(false);
      setAdjustStockData({ part_color_id: '', quantity: '', notes: '' });
      dispatch(fetchStockMovements());
      dispatch(fetchStockLevels());
      dispatch(fetchStockAlerts());
      dispatch(fetchPartsColors());
    } catch (err) {
      alert(`Failed to adjust stock: ${err.message || 'Unknown error'}`);
    }
  };

  const getMovementTypeColor = (type) => {
    const colors = {
      in: 'bg-green-100 text-green-800',
      out: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800',
      order: 'bg-purple-100 text-purple-800',
      return: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusColor = (status) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      low: 'bg-orange-100 text-orange-800',
      reorder: 'bg-yellow-100 text-yellow-800',
      good: 'bg-green-100 text-green-800',
      out_of_stock: 'bg-red-100 text-red-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      in_stock: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats
  const totalIn = movements
    .filter((m) => m.movement_type === 'in')
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = movements
    .filter((m) => m.movement_type === 'out')
    .reduce((sum, m) => sum + m.quantity, 0);
  const lowStockCount = levels.filter(
    (l) => l.stock_status === 'low' || l.stock_status === 'low_stock'
  ).length;
  const outOfStockCount = levels.filter(
    (l) => l.stock_status === 'critical' || l.stock_status === 'out_of_stock'
  ).length;

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Stock Management</h1>
          <p className='text-gray-600 mt-1'>
            Monitor and manage inventory levels
          </p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={() => setShowAdjustStockModal(true)}
            className='btn-secondary'
          >
            Adjust Stock
          </button>
          <button
            onClick={() => setShowAddStockModal(true)}
            className='btn-primary'
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Movements</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>
            {movements.length}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Stock In</p>
          <p className='text-3xl font-bold text-green-600 mt-2'>+{totalIn}</p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Stock Out</p>
          <p className='text-3xl font-bold text-red-600 mt-2'>-{totalOut}</p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Low Stock</p>
          <p className='text-3xl font-bold text-yellow-600 mt-2'>
            {lowStockCount}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Out of Stock</p>
          <p className='text-3xl font-bold text-red-600 mt-2'>
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='mb-6 border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Movements ({filteredMovements.length})
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'levels'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Levels ({filteredLevels.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Low Stock Alerts
            {alerts.length > 0 && (
              <span className='ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                {alerts.length}
              </span>
            )}
          </button>
        </nav>
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
            {activeTab === 'movements' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className='input-field'
              >
                <option value=''>All Types</option>
                <option value='in'>Stock In</option>
                <option value='out'>Stock Out</option>
                <option value='adjustment'>Adjustment</option>
                <option value='order'>Order</option>
                <option value='return'>Return</option>
              </select>
            )}

            {activeTab === 'levels' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='input-field'
              >
                <option value=''>All Status</option>
                <option value='good'>Good</option>
                <option value='in_stock'>In Stock</option>
                <option value='low'>Low</option>
                <option value='low_stock'>Low Stock</option>
                <option value='critical'>Critical</option>
                <option value='out_of_stock'>Out of Stock</option>
              </select>
            )}

            {(filterType || filterStatus) && (
              <button
                onClick={() => {
                  setFilterType('');
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
      ) : (
        <>
          {/* Stock Movements Tab */}
          {activeTab === 'movements' && (
            <div className='card overflow-hidden'>
              {filteredMovements.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>📊</div>
                  <p className='text-xl font-semibold text-gray-900 mb-2'>
                    {movements.length === 0
                      ? 'No Stock Movements Yet'
                      : 'No Results Found'}
                  </p>
                  <p className='text-gray-500'>
                    {movements.length === 0
                      ? 'Stock movements will appear here as you manage inventory'
                      : 'Try adjusting your search or filters'}
                  </p>
                </div>
              ) : (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Part
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Color
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Type
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Quantity
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Order Number
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Reference
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        User
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredMovements.map((movement) => (
                      <tr key={movement.id} className='hover:bg-gray-50'>
                        <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {movement.part_name}
                        </td>
                        <td className='px-4 py-4 whitespace-nowrap text-xs text-gray-500'>
                          {movement.color_name}
                        </td>
                        <td className='px-4 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 py-1 text-xs font-normal rounded-full ${getMovementTypeColor(
                              movement.movement_type
                            )}`}
                          >
                            {movement.movement_type?.toUpperCase()}
                          </span>
                        </td>
                        <td className='px-4 py-4 whitespace-nowrap text-xs'>
                          <span
                            className={`font-semibold ${
                              movement.movement_type === 'in'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {movement.movement_type === 'in' ? '+' : '-'}
                            {movement.quantity}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-xs text-gray-500'>
                          {movement.order_number || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-xs text-gray-500'>
                          {movement.reference_type || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-xs text-gray-500'>
                          {movement.user_username || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-xs text-gray-500'>
                          {formatDate(movement.created_at)}
                        </td>
                        <td className='px-6 py-4 text-xs text-gray-500 max-w-xs truncate text-wrap'>
                          {movement.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Stock Levels Tab */}
          {activeTab === 'levels' && (
            <div className='card overflow-hidden'>
              {filteredLevels.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>📦</div>
                  <p className='text-xl font-semibold text-gray-900 mb-2'>
                    {levels.length === 0
                      ? 'No Stock Levels Available'
                      : 'No Results Found'}
                  </p>
                </div>
              ) : (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Part
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Color
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Total Qty
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Reserved
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Available
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Min Level
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredLevels.map((level) => (
                      <tr key={level.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {level.part_name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {level.color_name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {level.total_quantity || level.quantity || 0}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {level.reserved_quantity || 0}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                          {level.available_quantity || level.quantity || 0}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {level.min_stock_level}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(
                              level.stock_status
                            )}`}
                          >
                            {level.stock_status
                              ?.replace('_', ' ')
                              .toUpperCase()}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                          <button
                            onClick={() => {
                              setAddStockData({
                                part_color_id: level.id,
                                quantity: '',
                                notes: `Restocking ${level.part_name} - ${level.color_name}`,
                              });
                              setShowAddStockModal(true);
                            }}
                            className='text-green-600 hover:text-green-900'
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setAdjustStockData({
                                part_color_id: level.id,
                                quantity:
                                  level.quantity || level.total_quantity || '',
                                notes: '',
                              });
                              setShowAdjustStockModal(true);
                            }}
                            className='text-blue-600 hover:text-blue-900'
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Low Stock Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className='card overflow-hidden'>
              {filteredAlerts.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='text-6xl mb-4'>✅</div>
                  <p className='text-xl font-semibold text-gray-900 mb-2'>
                    {alerts.length === 0
                      ? 'No Low Stock Alerts'
                      : 'No Results Found'}
                  </p>
                  <p className='text-gray-500'>
                    {alerts.length === 0
                      ? 'All items are well stocked'
                      : 'Try adjusting your search'}
                  </p>
                </div>
              ) : (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Part
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Color
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Available
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Min Level
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className='hover:bg-gray-50 bg-red-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {alert.part_name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {alert.color_name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600'>
                          {alert.available_quantity || alert.quantity || 0}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {alert.min_stock_level}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(
                              alert.stock_status
                            )}`}
                          >
                            {alert.stock_status
                              ?.replace('_', ' ')
                              .toUpperCase()}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                          <button
                            onClick={() => {
                              setAddStockData({
                                part_color_id: alert.id,
                                quantity: '',
                                notes: `Restocking ${alert.part_name} - ${alert.color_name}`,
                              });
                              setShowAddStockModal(true);
                            }}
                            className='bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700'
                          >
                            + Add Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Stock Modal */}
      <Modal
        isOpen={showAddStockModal}
        onClose={() => setShowAddStockModal(false)}
        title='Add Stock'
        size='md'
      >
        <form onSubmit={handleAddStock}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Part & Color
              </label>
              <select
                value={addStockData.part_color_id}
                onChange={(e) =>
                  setAddStockData({
                    ...addStockData,
                    part_color_id: e.target.value,
                  })
                }
                className='input-field'
                required
              >
                <option value=''>Select part & color</option>
                {partsColors.map((pc) => (
                  <option key={pc.id} value={pc.id}>
                    {pc.part_name} - {pc.color_name} (Current: {pc.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Quantity to Add
              </label>
              <input
                type='number'
                value={addStockData.quantity}
                onChange={(e) =>
                  setAddStockData({ ...addStockData, quantity: e.target.value })
                }
                className='input-field'
                placeholder='Enter quantity'
                min='1'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Notes
              </label>
              <textarea
                value={addStockData.notes}
                onChange={(e) =>
                  setAddStockData({ ...addStockData, notes: e.target.value })
                }
                className='input-field'
                rows='3'
                placeholder='Add notes about this restock...'
              />
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowAddStockModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-success'>
                + Add Stock
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={showAdjustStockModal}
        onClose={() => setShowAdjustStockModal(false)}
        title='Adjust Stock'
        size='md'
      >
        <form onSubmit={handleAdjustStock}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Part & Color
              </label>
              <select
                value={adjustStockData.part_color_id}
                onChange={(e) => {
                  const pc = partsColors.find(
                    (p) => p.id === parseInt(e.target.value)
                  );
                  setAdjustStockData({
                    ...adjustStockData,
                    part_color_id: e.target.value,
                    quantity: pc ? pc.quantity : '',
                  });
                }}
                className='input-field'
                required
              >
                <option value=''>Select part & color</option>
                {partsColors.map((pc) => (
                  <option key={pc.id} value={pc.id}>
                    {pc.part_name} - {pc.color_name} (Current: {pc.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                New Quantity
              </label>
              <input
                type='number'
                value={adjustStockData.quantity}
                onChange={(e) =>
                  setAdjustStockData({
                    ...adjustStockData,
                    quantity: e.target.value,
                  })
                }
                className='input-field'
                placeholder='Enter new quantity'
                min='0'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Notes
              </label>
              <textarea
                value={adjustStockData.notes}
                onChange={(e) =>
                  setAdjustStockData({
                    ...adjustStockData,
                    notes: e.target.value,
                  })
                }
                className='input-field'
                rows='3'
                placeholder='Reason for adjustment...'
              />
            </div>
            <div className='flex justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={() => setShowAdjustStockModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Adjust Stock
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockMovements;
