import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStockMovements,
  fetchStockLevels,
  fetchStockAlerts,
  addStock,
  adjustStock,
} from '../redux/slices/stockSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import {
  Modal,
  LoadingSpinner,
  StatsCard,
  EmptyState,
} from '../components/Common';
import { useSearch } from '../context/SearchContext';
import { useEntityDetails } from '../context/EntityDetailsContext';

const StockMovements = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();
  const { openPart } = useEntityDetails();

  // Redux state
  const { movements, levels, alerts, loading } = useSelector(
    (state) => state.stock,
  );
  const { items: parts } = useSelector((state) => state.parts);

  // Local state
  const [activeTab, setActiveTab] = useState('movements');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [addStockData, setAddStockData] = useState({
    part_id: '',
    quantity: '',
    notes: '',
  });

  const [adjustStockData, setAdjustStockData] = useState({
    part_id: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchStockMovements());
    dispatch(fetchStockLevels());
    dispatch(fetchStockAlerts());
    dispatch(fetchParts());
  }, [dispatch]);

  // Filter movements
  const filteredMovements = (movements || []).filter((movement) => {
    const matchesSearch =
      movement.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.part_color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user_username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      movement.reference_id?.toString().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || movement.movement_type === filterType;

    return matchesSearch && matchesType;
  });

  // Filter levels (parts with stock info)
  const filteredLevels = (levels || []).filter((level) => {
    const matchesSearch =
      level.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.sku?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !filterStatus || getStockStatusKey(level) === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Filter alerts
  const filteredAlerts = (alerts || []).filter((alert) => {
    return (
      alert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.color?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Get stock status key
  const getStockStatusKey = (item) => {
    const qty = item.available_quantity || 0;
    const minLevel = item.min_stock_level || 5;
    if (qty === 0) return 'out_of_stock';
    if (qty <= minLevel) return 'low_stock';
    return 'in_stock';
  };

  // Handlers
  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        addStock({
          part_id: parseInt(addStockData.part_id),
          quantity: parseInt(addStockData.quantity),
          notes: addStockData.notes,
        }),
      ).unwrap();

      setShowAddStockModal(false);
      setAddStockData({ part_id: '', quantity: '', notes: '' });
      refreshData();
    } catch (err) {
      alert(`Failed to add stock: ${err.message || err}`);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        adjustStock({
          part_id: parseInt(adjustStockData.part_id),
          quantity: parseInt(adjustStockData.quantity),
          notes: adjustStockData.notes,
        }),
      ).unwrap();

      setShowAdjustStockModal(false);
      setAdjustStockData({ part_id: '', quantity: '', notes: '' });
      refreshData();
    } catch (err) {
      alert(`Failed to adjust stock: ${err.message || err}`);
    }
  };

  const refreshData = () => {
    dispatch(fetchStockMovements());
    dispatch(fetchStockLevels());
    dispatch(fetchStockAlerts());
    dispatch(fetchParts());
  };

  // Helpers
  const getMovementTypeColor = (type) => {
    const colors = {
      in: 'bg-green-100 text-green-800',
      out: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800',
      production: 'bg-purple-100 text-purple-800',
      order_delivery: 'bg-teal-100 text-teal-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusColor = (status) => {
    const colors = {
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
  const totalIn = (movements || [])
    .filter(
      (m) => m.movement_type === 'in' || m.movement_type === 'order_delivery',
    )
    .reduce((sum, m) => sum + (m.quantity || 0), 0);

  const totalOut = (movements || [])
    .filter(
      (m) => m.movement_type === 'out' || m.movement_type === 'production',
    )
    .reduce((sum, m) => sum + (m.quantity || 0), 0);

  const lowStockCount = (levels || []).filter((l) => {
    const status = getStockStatusKey(l);
    return status === 'low_stock';
  }).length;

  const outOfStockCount = (levels || []).filter((l) => {
    const status = getStockStatusKey(l);
    return status === 'out_of_stock';
  }).length;

  return (
    <div>
      {/* Header */}
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

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-6'>
        <StatsCard
          label='Total Movements'
          value={(movements || []).length}
          color='gray'
        />
        <StatsCard label='Stock In' value={`+${totalIn}`} color='green' />
        <StatsCard label='Stock Out' value={`-${totalOut}`} color='red' />
        <StatsCard label='Low Stock' value={lowStockCount} color='orange' />
        <StatsCard label='Out of Stock' value={outOfStockCount} color='red' />
      </div>

      {/* Tabs */}
      <div className='mb-6 border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Movements ({filteredMovements.length})
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'levels'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock Levels ({filteredLevels.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Low Stock Alerts
            {(alerts || []).length > 0 && (
              <span className='ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                {alerts.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className='card mb-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div className='flex-1'>
            {searchTerm && (
              <p className='text-sm text-gray-600'>
                Searching: <span className='font-medium'>"{searchTerm}"</span>
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
                <option value='production'>Production</option>
                <option value='order_delivery'>Order Delivery</option>
              </select>
            )}
            {activeTab === 'levels' && (
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
            )}
            {(filterType || filterStatus) && (
              <button
                onClick={() => {
                  setFilterType('');
                  setFilterStatus('');
                }}
                className='btn-secondary'
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Movements Tab */}
          {activeTab === 'movements' && (
            <div className='card overflow-hidden'>
              {filteredMovements.length === 0 ? (
                <EmptyState
                  icon='📊'
                  title='No Stock Movements'
                  message='Movements will appear here as you manage inventory'
                  hasItems={(movements || []).length > 0}
                />
              ) : (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Part
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Type
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Qty
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Current stock
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Days until empty
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Reference
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Supplier
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        User
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Date
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-normal text-gray-500 uppercase'>
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredMovements.map((movement) => (
                      <tr key={movement.id} className='hover:bg-gray-50'>
                        <td className='px-4 py-4'>
                          <button
                            onClick={() => openPart(movement.part_id)}
                            className='text-sm font-medium text-blue-600 hover:text-blue-800 text-left'
                          >
                            {movement.part_name}
                          </button>
                          {movement.part_color && (
                            <p className='text-xs text-gray-500'>
                              {movement.part_color}
                            </p>
                          )}
                        </td>
                        <td className='px-4 py-4'>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getMovementTypeColor(movement.movement_type)}`}
                          >
                            {movement.movement_type?.toUpperCase()}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <span
                            className={`text-sm font-semibold ${
                              ['in', 'order_delivery'].includes(
                                movement.movement_type,
                              )
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {['in', 'order_delivery'].includes(
                              movement.movement_type,
                            )
                              ? '+'
                              : '-'}
                            {movement.quantity}
                          </span>
                        </td>
                        <td className='px-4 py-4 text-xs text-gray-500 text-right'>
                          {movement.current_stock || '-'}
                        </td>
                        <td className='px-4 py-4 text-xs text-gray-500 text-right'>
                          {movement.days_until_empty || '-'}
                        </td>
                        <td className='px-4 py-4 text-xs text-gray-500'>
                          {movement.reference_type && (
                            <span>
                              {movement.reference_type}
                              {movement.reference_id &&
                                ` #${movement.reference_id}`}
                            </span>
                          )}
                          {!movement.reference_type && '-'}
                        </td>

                        <td className='px-4 py-4 text-xs text-gray-500'>
                          {movement.supplier || '-'}
                        </td>
                        <td className='px-4 py-4 text-xs text-gray-500'>
                          {movement.user_name || '-'}
                        </td>
                        <td className='px-4 py-4 text-xs text-gray-500'>
                          {formatDate(movement.created_at)}
                        </td>
                        <td className='px-4 py-4 text-xs text-gray-500 max-w-xs truncate'>
                          {movement.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Levels Tab */}
          {activeTab === 'levels' && (
            <div className='card overflow-hidden'>
              {filteredLevels.length === 0 ? (
                <EmptyState
                  icon='📦'
                  title='No Stock Levels'
                  message='Add parts to see stock levels'
                  hasItems={(levels || []).length > 0}
                />
              ) : (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Part
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Order Number
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Quantity
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Min Level
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Status
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredLevels.map((level) => {
                      const status = getStockStatusKey(level);
                      return (
                        <tr key={level.id} className='hover:bg-gray-50'>
                          <td className='px-4 py-4'>
                            <button
                              onClick={() => openPart(level.id)}
                              className='text-sm font-medium text-blue-600 hover:text-blue-800'
                            >
                              {level.part_name}
                            </button>
                            {level.color_name && (
                              <p className='text-xs text-gray-500'>
                                {level.color_name}
                              </p>
                            )}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-500 font-mono'>
                            {level.sku || '-'}
                          </td>
                          <td className='px-4 py-4 text-sm font-semibold text-gray-900'>
                            {level.total_quantity || 0}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-500'>
                            {level.min_stock_level || 5}
                          </td>
                          <td className='px-4 py-4'>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(status)}`}
                            >
                              {status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className='px-4 py-4 text-right space-x-2'>
                            <button
                              onClick={() => {
                                setAddStockData({
                                  part_id: level.id,
                                  quantity: '',
                                  notes: `Restocking ${level.name}`,
                                });
                                setShowAddStockModal(true);
                              }}
                              className='text-green-600 hover:text-green-900 text-sm'
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setAdjustStockData({
                                  part_id: level.id,
                                  quantity: level.quantity || 0,
                                  notes: '',
                                });
                                setShowAdjustStockModal(true);
                              }}
                              className='text-blue-600 hover:text-blue-900 text-sm'
                            >
                              Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className='card overflow-hidden'>
              {filteredAlerts.length === 0 ? (
                <EmptyState
                  icon='✅'
                  title='No Low Stock Alerts'
                  message='All items are well stocked'
                  hasItems={(alerts || []).length > 0}
                />
              ) : (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Part
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Current
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Min Level
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Status
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredAlerts.map((alert) => {
                      const status = getStockStatusKey(alert);
                      return (
                        <tr
                          key={alert.id}
                          className='hover:bg-gray-50 bg-red-50'
                        >
                          <td className='px-4 py-4'>
                            <p className='text-sm font-medium text-gray-900'>
                              {alert.name}
                            </p>
                            {alert.color && (
                              <p className='text-xs text-gray-500'>
                                {alert.color}
                              </p>
                            )}
                          </td>
                          <td className='px-4 py-4 text-sm font-semibold text-red-600'>
                            {alert.quantity || 0}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-500'>
                            {alert.min_stock_level || 5}
                          </td>
                          <td className='px-4 py-4'>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(status)}`}
                            >
                              {status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className='px-4 py-4 text-right'>
                            <button
                              onClick={() => {
                                setAddStockData({
                                  part_id: alert.id,
                                  quantity: '',
                                  notes: `Restocking ${alert.name}`,
                                });
                                setShowAddStockModal(true);
                              }}
                              className='bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm'
                            >
                              + Add Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
        <form onSubmit={handleAddStock} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Part
            </label>
            <select
              value={addStockData.part_id}
              onChange={(e) =>
                setAddStockData({ ...addStockData, part_id: e.target.value })
              }
              className='input-field'
              required
            >
              <option value=''>Select part</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.color ? `(${p.color})` : ''} - Current:{' '}
                  {p.quantity || 0}
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
              rows='2'
              placeholder='Notes about this restock...'
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
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={showAdjustStockModal}
        onClose={() => setShowAdjustStockModal(false)}
        title='Adjust Stock'
        size='md'
      >
        <form onSubmit={handleAdjustStock} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Part
            </label>
            <select
              value={adjustStockData.part_id}
              onChange={(e) => {
                const part = parts.find(
                  (p) => p.id === parseInt(e.target.value),
                );
                setAdjustStockData({
                  ...adjustStockData,
                  part_id: e.target.value,
                  quantity: part ? part.quantity || 0 : '',
                });
              }}
              className='input-field'
              required
            >
              <option value=''>Select part</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.color ? `(${p.color})` : ''} - Current:{' '}
                  {p.quantity || 0}
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
              Reason
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
              rows='2'
              placeholder='Reason for adjustment...'
              required
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
        </form>
      </Modal>
    </div>
  );
};

export default StockMovements;
