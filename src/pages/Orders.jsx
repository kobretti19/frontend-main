import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  fetchOrderStats,
} from '../redux/slices/ordersSlice';
import { fetchParts } from '../redux/slices/partsSlice';
import { ordersAPI } from '../api/api';
import {
  Modal,
  ConfirmDialog,
  LoadingSpinner,
  StatsCard,
  EmptyState,
} from '../components/Common';
import { useSearch } from '../context/SearchContext';

const Orders = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();

  // Redux state
  const {
    items: orders,
    stats,
    loading,
  } = useSelector((state) => state.orders);
  const { items: parts } = useSelector((state) => state.parts);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form
  const [formData, setFormData] = useState({
    order_number: '',
    notes: '',
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    part_id: '',
    quantity: 1,
    unit_price: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchOrderStats());
    dispatch(fetchParts());
  }, [dispatch]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const resetForm = () => {
    setFormData({ order_number: '', notes: '', items: [] });
    setCurrentItem({ part_id: '', quantity: 1, unit_price: '', notes: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      await dispatch(createOrder(formData)).unwrap();
      setShowCreateModal(false);
      resetForm();
      dispatch(fetchOrderStats());
    } catch (err) {
      alert(`Failed to create order: ${err.message || err}`);
    }
  };

  const addItemToList = () => {
    if (!currentItem.part_id || currentItem.quantity <= 0) {
      alert('Please select a part and enter valid quantity');
      return;
    }

    const part = parts.find((p) => p.id === parseInt(currentItem.part_id));
    if (!part) {
      alert('Part not found');
      return;
    }

    const exists = formData.items.find(
      (item) => item.part_id === parseInt(currentItem.part_id),
    );
    if (exists) {
      alert('This part is already added');
      return;
    }

    const unitPrice = currentItem.unit_price || part.purchase_price || 0;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          part_id: parseInt(currentItem.part_id),
          quantity: parseInt(currentItem.quantity),
          unit_price: parseFloat(unitPrice),
          notes: currentItem.notes || '',
          // Display info
          part_name: part.name,
          part_color: part.color,
          part_sku: part.sku,
        },
      ],
    });

    setCurrentItem({ part_id: '', quantity: 1, unit_price: '', notes: '' });
  };

  const removeItemFromList = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItemField = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const handleViewOrder = async (order) => {
    try {
      const response = await ordersAPI.getById(order.id);
      setOrderDetails(response.data.data);
      setShowViewModal(true);
    } catch (err) {
      alert(`Failed to load order: ${err.message || err}`);
    }
  };

  const handleOpenDeliveryModal = async (order) => {
    try {
      const response = await ordersAPI.getById(order.id);
      const fullOrder = response.data.data;

      setSelectedOrder(fullOrder);

      const isPartial = order.status === 'partial';

      setDeliveryItems(
        fullOrder.items?.map((item) => {
          const ordered = item.total_quantity || 0;
          const alreadyDelivered = item.quantity_delivered || 0;
          const currentBackorder = item.quantity_backorder || 0;

          return {
            id: item.id,
            part_id: item.part_id,
            part_name: item.part_name,
            part_color: item.part_color,
            quantity_ordered: ordered,
            quantity_already_delivered: alreadyDelivered,
            quantity_delivered: isPartial ? alreadyDelivered : ordered,
            quantity_backorder: isPartial ? currentBackorder : 0,
            quantity_receiving: isPartial ? 0 : ordered,
            item_status: item.item_status || 'delivered',
            unit_price: item.unit_price,
            notes: item.notes || '',
          };
        }) || [],
      );
      setDeliveryNotes('');
      setShowDeliveryModal(true);
    } catch (err) {
      alert(`Failed to load order: ${err.message || err}`);
    }
  };

  const handleReceivingChange = (index, receivingQty) => {
    const updated = [...deliveryItems];
    const item = updated[index];
    const ordered = item.quantity_ordered;
    const alreadyDelivered = item.quantity_already_delivered || 0;

    receivingQty = Math.max(0, parseInt(receivingQty) || 0);

    const totalDelivered = alreadyDelivered + receivingQty;
    const remaining = ordered - totalDelivered;

    item.quantity_receiving = receivingQty;
    item.quantity_delivered = totalDelivered;
    item.quantity_backorder = Math.max(0, remaining);

    if (totalDelivered === 0) {
      item.item_status = 'backorder';
    } else if (remaining > 0) {
      item.item_status = 'partial';
    } else {
      item.item_status = 'delivered';
    }

    setDeliveryItems(updated);
  };

  const handleItemStatusChange = (index, status) => {
    const updated = [...deliveryItems];
    const item = updated[index];
    item.item_status = status;

    if (status === 'cancelled') {
      item.quantity_delivered = 0;
      item.quantity_backorder = 0;
    } else if (status === 'backorder') {
      item.quantity_delivered = 0;
      item.quantity_backorder = item.quantity_ordered;
    }

    setDeliveryItems(updated);
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();

    const totalReceiving = deliveryItems.reduce(
      (sum, item) => sum + (item.quantity_receiving || 0),
      0,
    );
    if (totalReceiving === 0) {
      alert('Please enter quantities to receive');
      return;
    }

    try {
      const itemsPayload = deliveryItems.map((item) => ({
        id: item.id,
        part_id: item.part_id,
        quantity_delivered: parseInt(item.quantity_receiving) || 0,
        quantity_backorder: parseInt(item.quantity_backorder) || 0,
        item_status: item.item_status,
      }));

      const hasBackorder = deliveryItems.some(
        (item) => item.quantity_backorder > 0,
      );

      await dispatch(
        updateOrderStatus({
          id: selectedOrder.id,
          status: hasBackorder ? 'partial' : 'delivered',
          notes: deliveryNotes,
          items: itemsPayload,
        }),
      ).unwrap();

      setShowDeliveryModal(false);
      setSelectedOrder(null);
      setDeliveryItems([]);
      dispatch(fetchOrders());
      dispatch(fetchOrderStats());
      dispatch(fetchParts());
    } catch (err) {
      alert(`Failed to process delivery: ${err.message || err}`);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      await dispatch(
        updateOrderStatus({
          id: order.id,
          status: newStatus,
          notes: '',
          items: [],
        }),
      ).unwrap();
      dispatch(fetchOrders());
      dispatch(fetchOrderStats());
    } catch (err) {
      alert(`Failed to update status: ${err.message || err}`);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteOrder(selectedOrder.id)).unwrap();
      setShowDeleteDialog(false);
      setSelectedOrder(null);
      dispatch(fetchOrderStats());
    } catch (err) {
      alert(`Failed to cancel order: ${err.message || err}`);
    }
  };

  // Helpers
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      ordered: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      partial: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getItemStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      delivered: 'bg-green-100 text-green-800',
      partial: 'bg-orange-100 text-orange-800',
      backorder: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    if (!status) return '-';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateTotal = (items) => {
    return items.reduce(
      (total, item) =>
        total + (parseFloat(item.unit_price) || 0) * item.quantity,
      0,
    );
  };

  return (
    <div>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Orders</h1>
          <p className='text-gray-600 mt-1'>Manage supplier orders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Create Order
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
        <StatsCard
          label='Total'
          value={stats?.overall?.total_orders || orders.length}
          color='gray'
        />
        <StatsCard
          label='Pending'
          value={stats?.overall?.pending || 0}
          color='orange'
        />
        <StatsCard
          label='Ordered'
          value={stats?.overall?.ordered || 0}
          color='purple'
        />
        <StatsCard
          label='Delivered'
          value={stats?.overall?.delivered || 0}
          color='green'
        />
        <StatsCard
          label='Partial'
          value={stats?.overall?.partial || 0}
          color='red'
        />
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='input-field'
            >
              <option value=''>All Status</option>
              <option value='draft'>Draft</option>
              <option value='pending'>Pending</option>
              <option value='ordered'>Ordered</option>
              <option value='delivered'>Delivered</option>
              <option value='partial'>Partial</option>
              <option value='cancelled'>Cancelled</option>
            </select>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus('')}
                className='btn-secondary'
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon='📦'
          title='No Orders Yet'
          message='Create your first order'
          actionLabel='+ Create Order'
          onAction={() => setShowCreateModal(true)}
          hasItems={orders.length > 0}
        />
      ) : (
        <div className='card overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Order
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Items
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Total
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Notes
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Date
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredOrders.map((order) => (
                <tr key={order.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-3'>
                    <p className='text-sm font-medium text-gray-900'>
                      {order.order_number || `#${order.id}`}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {order.fullname || '-'}
                    </p>
                  </td>
                  <td className='px-4 py-3'>
                    <p className='text-sm text-gray-600'>
                      {order.total_quantity || 0} items
                    </p>
                    {order.total_backorder > 0 && (
                      <p className='text-xs text-orange-600'>
                        ⚠️ {order.total_backorder} backorder
                      </p>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    <p className='text-sm font-semibold'>
                      CHF {parseFloat(order.total_amount || 0).toFixed(2)}
                    </p>
                  </td>
                  <td className='px-4 py-3'>
                    <p className='text-sm text-gray-600 max-w-xs truncate'>
                      {order.notes || '-'}
                    </p>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-500'>
                    {formatDate(order.created_at)}
                  </td>
                  <td className='px-4 py-3 text-right text-sm space-x-1'>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className='text-purple-600 hover:text-purple-900'
                    >
                      View
                    </button>

                    {order.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(order, 'ordered')}
                        className='text-purple-600 hover:text-purple-900'
                      >
                        → Ordered
                      </button>
                    )}

                    {order.status === 'ordered' && (
                      <button
                        onClick={() => handleOpenDeliveryModal(order)}
                        className='text-green-600 hover:text-green-900 font-medium'
                      >
                        📦 Receive
                      </button>
                    )}

                    {order.status === 'partial' && (
                      <button
                        onClick={() => handleOpenDeliveryModal(order)}
                        className='text-orange-600 hover:text-orange-900 font-medium'
                      >
                        📦 More
                      </button>
                    )}

                    {!['delivered', 'cancelled'].includes(order.status) && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDeleteDialog(true);
                        }}
                        className='text-red-600 hover:text-red-900'
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title='Create Order'
        size='xl'
      >
        <form onSubmit={handleCreate} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
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
                placeholder='e.g., PO-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Order Notes
              </label>
              <input
                type='text'
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className='input-field'
                placeholder='General order notes...'
              />
            </div>
          </div>

          {/* Add Items */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Add Items ({formData.items.length})
            </label>
            <div className='bg-gray-50 p-3 rounded-lg mb-3 space-y-2'>
              <div className='grid grid-cols-5 gap-2'>
                <select
                  value={currentItem.part_id}
                  onChange={(e) => {
                    const part = parts.find(
                      (p) => p.id === parseInt(e.target.value),
                    );
                    setCurrentItem({
                      ...currentItem,
                      part_id: e.target.value,
                      unit_price: part?.purchase_price || '',
                    });
                  }}
                  className='input-field col-span-2'
                >
                  <option value=''>Select part</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.color ? `(${p.color})` : ''} - CHF{' '}
                      {p.purchase_price || 0}
                    </option>
                  ))}
                </select>
                <input
                  type='number'
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, quantity: e.target.value })
                  }
                  className='input-field'
                  placeholder='Qty'
                  min='1'
                />
                <input
                  type='number'
                  step='0.01'
                  value={currentItem.unit_price}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      unit_price: e.target.value,
                    })
                  }
                  className='input-field'
                  placeholder='Price'
                />
                <button
                  type='button'
                  onClick={addItemToList}
                  className='btn-success'
                >
                  Add
                </button>
              </div>
              {/* Per-item notes input */}
              <input
                type='text'
                value={currentItem.notes}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, notes: e.target.value })
                }
                className='input-field'
                placeholder='Item notes (e.g., color preference, size, special request...)'
              />
            </div>

            {formData.items.length > 0 && (
              <div className='border rounded-lg overflow-hidden'>
                <table className='min-w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                        Part
                      </th>
                      <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                        Qty
                      </th>
                      <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                        Price
                      </th>
                      <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                        Notes
                      </th>
                      <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                        Subtotal
                      </th>
                      <th className='px-3 py-2'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className='px-3 py-2 text-sm'>
                          <p className='font-medium'>{item.part_name}</p>
                          {item.part_color && (
                            <p className='text-xs text-gray-500'>
                              {item.part_color}
                            </p>
                          )}
                          {item.part_sku && (
                            <p className='text-xs text-gray-400'>
                              {item.part_sku}
                            </p>
                          )}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          <input
                            type='number'
                            min='1'
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemField(
                                index,
                                'quantity',
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className='w-16 input-field text-center text-sm'
                          />
                        </td>
                        <td className='px-3 py-2 text-center text-sm'>
                          CHF {parseFloat(item.unit_price).toFixed(2)}
                        </td>
                        <td className='px-3 py-2'>
                          <input
                            type='text'
                            value={item.notes || ''}
                            onChange={(e) =>
                              updateItemField(index, 'notes', e.target.value)
                            }
                            className='w-full input-field text-sm'
                            placeholder='Item notes...'
                          />
                        </td>
                        <td className='px-3 py-2 text-center text-sm font-medium'>
                          CHF {(item.unit_price * item.quantity).toFixed(2)}
                        </td>
                        <td className='px-3 py-2 text-right'>
                          <button
                            type='button'
                            onClick={() => removeItemFromList(index)}
                            className='text-red-600 hover:text-red-800'
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className='bg-gray-50 font-semibold'>
                      <td colSpan='4' className='px-3 py-2 text-right'>
                        Total:
                      </td>
                      <td className='px-3 py-2 text-center'>
                        CHF {calculateTotal(formData.items).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className='flex justify-end space-x-3 pt-4 border-t'>
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
            <button
              type='submit'
              className='btn-primary'
              disabled={formData.items.length === 0}
            >
              Create Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Delivery Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => {
          setShowDeliveryModal(false);
          setSelectedOrder(null);
        }}
        title={`Receive Delivery - ${selectedOrder?.order_number || '#' + selectedOrder?.id}`}
        size='xl'
      >
        <form onSubmit={handleDeliverySubmit} className='space-y-4'>
          <div className='bg-blue-50 p-3 rounded-lg text-sm text-blue-800'>
            Enter the quantity received for each item. Remaining items will be
            marked as backorder.
          </div>

          <div className='border rounded-lg overflow-hidden'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                    Part
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                    Ordered
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                    Already
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                    Receiving
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                    Backorder
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {deliveryItems.map((item, index) => {
                  const isComplete =
                    (item.quantity_already_delivered || 0) >=
                    item.quantity_ordered;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={isComplete ? 'bg-green-50' : ''}>
                        <td className='px-3 py-2'>
                          <p className='text-sm font-medium'>
                            {item.part_name}
                          </p>
                          {item.part_color && (
                            <p className='text-xs text-gray-500'>
                              {item.part_color}
                            </p>
                          )}
                        </td>
                        <td className='px-3 py-2 text-center text-sm'>
                          {item.quantity_ordered}
                        </td>
                        <td className='px-3 py-2 text-center text-sm text-green-600'>
                          {item.quantity_already_delivered || 0}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          {isComplete ? (
                            <span className='text-green-600 text-sm'>✓</span>
                          ) : (
                            <input
                              type='number'
                              min='0'
                              value={item.quantity_receiving || 0}
                              onChange={(e) =>
                                handleReceivingChange(index, e.target.value)
                              }
                              className='w-20 input-field text-center'
                              disabled={item.item_status === 'cancelled'}
                            />
                          )}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className={
                              item.quantity_backorder > 0
                                ? 'text-orange-600 font-medium'
                                : 'text-gray-400'
                            }
                          >
                            {item.quantity_backorder}
                          </span>
                        </td>
                        <td className='px-3 py-2 text-center'>
                          <select
                            value={item.item_status}
                            onChange={(e) =>
                              handleItemStatusChange(index, e.target.value)
                            }
                            className={`text-xs px-2 py-1 rounded-full border-0 ${getItemStatusColor(item.item_status)}`}
                            disabled={isComplete}
                          >
                            <option value='delivered'>Delivered</option>
                            <option value='partial'>Partial</option>
                            <option value='backorder'>Backorder</option>
                            <option value='cancelled'>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                      {/* Show item notes if present */}
                      {item.notes && (
                        <tr className='bg-blue-50'>
                          <td
                            colSpan='6'
                            className='px-3 py-1 text-xs text-blue-700'
                          >
                            📝 {item.notes}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className='grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg'>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Ordered</p>
              <p className='text-xl font-bold'>
                {deliveryItems.reduce(
                  (s, i) => s + Number(i.quantity_ordered),
                  0,
                )}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Already</p>
              <p className='text-xl font-bold text-blue-600'>
                {deliveryItems.reduce(
                  (s, i) => s + Number(i.quantity_already_delivered || 0),
                  0,
                )}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Receiving</p>
              <p className='text-xl font-bold text-green-600'>
                {deliveryItems.reduce(
                  (s, i) => s + Number(i.quantity_receiving || 0),
                  0,
                )}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>Backorder</p>
              <p className='text-xl font-bold text-orange-600'>
                {deliveryItems.reduce(
                  (s, i) => s + Number(i.quantity_backorder),
                  0,
                )}
              </p>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Delivery Notes
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className='input-field'
              rows='2'
              placeholder='Notes about this delivery...'
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <button
              type='button'
              onClick={() => setShowDeliveryModal(false)}
              className='btn-secondary'
            >
              Cancel
            </button>
            <button type='submit' className='btn-primary'>
              Confirm Delivery
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Order - ${orderDetails?.order_number || '#' + orderDetails?.id}`}
        size='lg'
      >
        {orderDetails && (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg'>
              <div>
                <p className='text-xs text-gray-600'>Status</p>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(orderDetails.status)}`}
                >
                  {formatStatus(orderDetails.status)}
                </span>
              </div>
              <div>
                <p className='text-xs text-gray-600'>Created</p>
                <p className='font-semibold'>
                  {formatDate(orderDetails.created_at)}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-600'>Created By</p>
                <p className='font-semibold'>
                  {orderDetails.created_by_username || '-'}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-600'>Total</p>
                <p className='text-lg font-bold'>
                  CHF {parseFloat(orderDetails.total_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className='border rounded-lg overflow-hidden'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                      Part
                    </th>
                    <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                      Qty
                    </th>
                    <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                      Delivered
                    </th>
                    <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                      Backorder
                    </th>
                    <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {orderDetails.items?.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td className='px-3 py-2 text-sm'>
                          {item.part_name}{' '}
                          {item.part_color && (
                            <span className='text-gray-500'>
                              ({item.part_color})
                            </span>
                          )}
                        </td>
                        <td className='px-3 py-2 text-center text-sm'>
                          {item.total_quantity}
                        </td>
                        <td className='px-3 py-2 text-center text-sm text-green-600'>
                          {item.quantity_delivered || 0}
                        </td>
                        <td className='px-3 py-2 text-center text-sm'>
                          {item.quantity_backorder > 0 ? (
                            <span className='text-orange-600'>
                              {item.quantity_backorder}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getItemStatusColor(item.item_status)}`}
                          >
                            {formatStatus(item.item_status)}
                          </span>
                        </td>
                      </tr>
                      {/* Show item notes if present */}
                      {item.notes && (
                        <tr className='bg-blue-50'>
                          <td
                            colSpan='5'
                            className='px-3 py-1 text-xs text-blue-700'
                          >
                            📝 {item.notes}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {orderDetails.notes && (
              <div>
                <p className='text-sm font-medium text-gray-700 mb-1'>
                  Order Notes
                </p>
                <div className='bg-gray-50 p-3 rounded-lg text-sm'>
                  {orderDetails.notes}
                </div>
              </div>
            )}

            <div className='flex justify-end pt-4 border-t'>
              <button
                onClick={() => setShowViewModal(false)}
                className='btn-secondary'
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title='Cancel Order'
        message={`Cancel order "${selectedOrder?.order_number || '#' + selectedOrder?.id}"?`}
      />
    </div>
  );
};

export default Orders;
