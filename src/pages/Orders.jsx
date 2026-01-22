import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  fetchOrderStats,
} from '../redux/slices/ordersSlice';
import { fetchPartsColors } from '../redux/slices/partsColorsSlice';
import { ordersAPI } from '../api/api';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useSearch } from '../context/SearchContext';

const Orders = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSearch();

  const orders = useSelector((state) => state.orders?.items || []);
  const stats = useSelector((state) => state.orders?.stats || null);
  const loading = useSelector((state) => state.orders?.loading || false);
  const partsColors = useSelector((state) => state.partsColors?.items || []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    notes: '',
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    part_color_id: '',
    quantity: 1,
    notes: '',
  });
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchOrderStats());
    dispatch(fetchPartsColors());
  }, [dispatch]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    try {
      await dispatch(createOrder(formData)).unwrap();
      setShowCreateModal(false);
      setFormData({ notes: '', items: [] });
      dispatch(fetchOrders());
      dispatch(fetchOrderStats());
    } catch (err) {
      alert(`Failed to create order: ${err.message || 'Unknown error'}`);
    }
  };

  const addItemToList = () => {
    if (!currentItem.part_color_id || currentItem.quantity <= 0) {
      alert('Please select a part and enter valid quantity');
      return;
    }

    const partColor = partsColors.find(
      (pc) => pc.id === parseInt(currentItem.part_color_id),
    );

    if (!partColor) {
      alert('Part color not found');
      return;
    }

    const exists = formData.items.find(
      (item) => item.part_color_id === parseInt(currentItem.part_color_id),
    );

    if (exists) {
      alert('This part is already added to the order');
      return;
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          part_color_id: parseInt(currentItem.part_color_id),
          quantity: parseInt(currentItem.quantity),
          notes: currentItem.notes || '',
          part_name: partColor.part_name,
          color_name: partColor.color_name,
          purchase_price: partColor.purchase_price || 0,
        },
      ],
    });

    setCurrentItem({ part_color_id: '', quantity: 1, notes: '' });
  };

  const updateItemNotes = (index, notes) => {
    const updatedItems = [...formData.items];
    updatedItems[index].notes = notes;
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItemFromList = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleViewOrder = async (order) => {
    try {
      const response = await ordersAPI.getById(order.id);
      setOrderDetails(response.data.data);
      setShowViewModal(true);
    } catch (err) {
      alert(`Failed to load order details: ${err.message || 'Unknown error'}`);
    }
  };

  const handleOpenDeliveryModal = async (order) => {
    try {
      const response = await ordersAPI.getById(order.id);
      const fullOrder = response.data.data;

      setSelectedOrder(fullOrder);

      // Initialize delivery items with current quantities
      // For partial_delivered orders, show what's already been delivered
      // and set new delivery to 0 (user enters what they're receiving NOW)
      const isPartialDelivery = order.status === 'partial_delivered';

      setDeliveryItems(
        fullOrder.items?.map((item) => {
          const ordered = item.quantity_ordered || item.quantity;
          const alreadyDelivered = item.quantity_delivered || 0;
          const currentBackorder = item.quantity_backorder || 0;

          return {
            id: item.id,
            part_color_id: item.part_color_id,
            part_name: item.part_name,
            color_name: item.color_name,
            quantity_ordered: ordered,
            quantity_already_delivered: alreadyDelivered, // Track what was already delivered
            quantity_delivered: isPartialDelivery ? alreadyDelivered : ordered, // Start with already delivered or full
            quantity_backorder: isPartialDelivery ? currentBackorder : 0,
            quantity_receiving: isPartialDelivery ? 0 : ordered, // NEW: what they're receiving now
            item_status: item.item_status || 'delivered',
            purchase_price_at_order: item.purchase_price_at_order,
            notes: item.notes || '',
          };
        }) || [],
      );
      setDeliveryNotes('');
      setShowDeliveryModal(true);
    } catch (err) {
      alert(`Failed to load order: ${err.message || 'Unknown error'}`);
    }
  };

  const handleReceivingChange = (index, receivingQty) => {
    const updated = [...deliveryItems];
    const item = updated[index];
    const ordered = item.quantity_ordered;
    const alreadyDelivered = item.quantity_already_delivered || 0;

    receivingQty = Math.max(0, Math.min(parseInt(receivingQty) || 0));

    const totalDelivered = alreadyDelivered + receivingQty;
    const remaining = ordered - totalDelivered;

    item.quantity_receiving = receivingQty;
    item.quantity_delivered = totalDelivered;
    item.quantity_backorder = remaining;

    // Auto-set status based on quantities
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

    // Adjust quantities based on status
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

    // Check if there's anything to receive
    const totalReceiving = deliveryItems.reduce(
      (sum, item) => sum + (item.quantity_receiving || 0),
      0,
    );
    if (totalReceiving === 0) {
      alert('Please enter quantities to receive');
      return;
    }

    try {
      // Send only the quantity being received NOW (not total delivered)
      const itemsPayload = deliveryItems.map((item) => ({
        id: item.id,
        part_color_id: item.part_color_id,
        quantity_delivered: parseInt(item.quantity_receiving) || 0, // Send what we're receiving NOW
        quantity_backorder: parseInt(item.quantity_backorder) || 0,
        item_status: item.item_status,
      }));

      const hasBackorder = deliveryItems.some(
        (item) => item.quantity_backorder > 0,
      );

      await dispatch(
        updateOrderStatus({
          id: selectedOrder.id,
          status: hasBackorder ? 'partial_delivered' : 'delivered',
          notes: deliveryNotes,
          items: itemsPayload,
        }),
      ).unwrap();

      setShowDeliveryModal(false);
      setSelectedOrder(null);
      setDeliveryItems([]);
      setDeliveryNotes('');
      dispatch(fetchOrders());
      dispatch(fetchOrderStats());
      dispatch(fetchPartsColors());
    } catch (err) {
      alert(`Failed to process delivery: ${err.message || 'Unknown error'}`);
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
      alert(`Failed to update status: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteOrder(selectedOrder.id)).unwrap();
      setShowDeleteDialog(false);
      setSelectedOrder(null);
      dispatch(fetchOrders());
      dispatch(fetchOrderStats());
    } catch (err) {
      alert(`Failed to cancel order: ${err.message || 'Unknown error'}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting_for_answer: 'bg-yellow-100 text-yellow-800',
      to_order: 'bg-blue-100 text-blue-800',
      ordered: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      partial_delivered: 'bg-orange-100 text-orange-800',
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
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
        total + (parseFloat(item.purchase_price) || 0) * item.quantity,
      0,
    );
  };

  const calculateDeliveryTotal = () => {
    return deliveryItems.reduce(
      (total, item) =>
        total +
        (parseFloat(item.purchase_price_at_order) || 0) *
          item.quantity_delivered,
      0,
    );
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Orders</h1>
          <p className='text-gray-600 mt-1'>Manage your supplier orders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='btn-primary'
        >
          + Create Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-6 gap-4 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total</p>
          <p className='text-2xl font-bold text-gray-900 mt-1'>
            {stats?.overall?.total_orders || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Waiting</p>
          <p className='text-2xl font-bold text-yellow-600 mt-1'>
            {stats?.overall?.waiting_for_answer || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Ordered</p>
          <p className='text-2xl font-bold text-purple-600 mt-1'>
            {stats?.overall?.ordered || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Delivered</p>
          <p className='text-2xl font-bold text-green-600 mt-1'>
            {stats?.overall?.delivered || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Partial</p>
          <p className='text-2xl font-bold text-orange-600 mt-1'>
            {stats?.overall?.partial_delivered || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Backorder Items</p>
          <p className='text-2xl font-bold text-red-600 mt-1'>
            {stats?.overall?.backorder_items || 0}
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
              <option value='waiting_for_answer'>Waiting</option>
              <option value='to_order'>To Order</option>
              <option value='ordered'>Ordered</option>
              <option value='delivered'>Delivered</option>
              <option value='partial_delivered'>Partial Delivered</option>
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

      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <div className='card text-center py-12'>
          <div className='text-6xl mb-4'>📦</div>
          <p className='text-xl font-semibold text-gray-900 mb-2'>
            {orders.length === 0 ? 'No Orders Yet' : 'No Results Found'}
          </p>
          <p className='text-gray-500 mb-6'>
            {orders.length === 0
              ? 'Create your first order'
              : 'Try adjusting your search'}
          </p>
          {orders.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className='btn-primary'
            >
              + Create Order
            </button>
          )}
        </div>
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
                      {order.order_number}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {order.created_by_name}
                    </p>
                  </td>
                  <td className='px-4 py-3'>
                    <p className='text-sm text-gray-600 max-w-xs truncate'>
                      {order.items_summary || `${order.total_items} items`}
                    </p>
                    {order.total_backorder > 0 && (
                      <p className='text-xs text-orange-600'>
                        ⚠️ {order.total_backorder} on backorder
                      </p>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    <p className='text-sm font-semibold'>
                      CHF {parseFloat(order.total_amount || 0).toFixed(2)}
                    </p>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status,
                      )}`}
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

                    {/* Status progression buttons */}
                    {order.status === 'waiting_for_answer' && (
                      <button
                        onClick={() => handleStatusChange(order, 'to_order')}
                        className='text-blue-600 hover:text-blue-900'
                      >
                        → To Order
                      </button>
                    )}

                    {order.status === 'to_order' && (
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

                    {order.status === 'partial_delivered' && (
                      <button
                        onClick={() => handleOpenDeliveryModal(order)}
                        className='text-orange-600 hover:text-orange-900 font-medium'
                      >
                        📦 Receive More
                      </button>
                    )}

                    {order.status !== 'delivered' &&
                      order.status !== 'cancelled' && (
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

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ notes: '', items: [] });
        }}
        title='Create New Order'
        size='lg'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className='input-field'
                rows='2'
                placeholder='Order notes...'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Add Items ({formData.items.length})
              </label>
              <div className='bg-gray-50 p-3 rounded-lg mb-3'>
                <div className='grid grid-cols-4 gap-2'>
                  <select
                    value={currentItem.part_color_id}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        part_color_id: e.target.value,
                      })
                    }
                    className='input-field col-span-2'
                  >
                    <option value=''>Select part & color</option>
                    {partsColors.map((pc) => (
                      <option key={pc.id} value={pc.id}>
                        {pc.part_name} - {pc.color_name} (CHF{' '}
                        {pc.purchase_price || 0})
                      </option>
                    ))}
                  </select>
                  <input
                    type='number'
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: e.target.value,
                      })
                    }
                    className='input-field'
                    placeholder='Qty'
                    min='1'
                  />
                  <button
                    type='button'
                    onClick={addItemToList}
                    className='btn-success'
                  >
                    Add
                  </button>
                </div>
              </div>

              {formData.items.length > 0 && (
                <div className='border rounded-lg overflow-hidden'>
                  <table className='min-w-full'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                          Part
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                          Qty
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                          Notes
                        </th>
                        <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                          Subtotal
                        </th>
                        <th className='px-3 py-2 text-right text-xs font-medium text-gray-500'></th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td className='px-3 py-2 text-sm'>
                            <p className='font-medium'>{item.part_name}</p>
                            <p className='text-xs text-gray-500'>
                              {item.color_name}
                            </p>
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='number'
                              min='1'
                              value={item.quantity}
                              onChange={(e) => {
                                const updatedItems = [...formData.items];
                                updatedItems[index].quantity =
                                  parseInt(e.target.value) || 1;
                                setFormData({
                                  ...formData,
                                  items: updatedItems,
                                });
                              }}
                              className='w-16 input-field text-sm'
                            />
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='text'
                              value={item.notes || ''}
                              onChange={(e) =>
                                updateItemNotes(index, e.target.value)
                              }
                              className='w-full input-field text-sm'
                              placeholder='Item notes...'
                            />
                          </td>
                          <td className='px-3 py-2 text-sm'>
                            CHF{' '}
                            {(item.purchase_price * item.quantity).toFixed(2)}
                          </td>
                          <td className='px-3 py-2 text-right'>
                            <button
                              type='button'
                              onClick={() => removeItemFromList(index)}
                              className='text-red-600 text-sm'
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className='bg-gray-50 font-semibold'>
                        <td colSpan='3' className='px-3 py-2 text-right'>
                          Total:
                        </td>
                        <td className='px-3 py-2'>
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
                onClick={() => setShowCreateModal(false)}
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
          </div>
        </form>
      </Modal>

      {/* Delivery Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => {
          setShowDeliveryModal(false);
          setSelectedOrder(null);
          setDeliveryItems([]);
        }}
        title={`Receive Delivery - ${selectedOrder?.order_number}`}
        size='xl'
      >
        <form onSubmit={handleDeliverySubmit}>
          <div className='space-y-4'>
            <div className='bg-blue-50 p-3 rounded-lg text-sm text-blue-800'>
              <strong>Instructions:</strong> Enter the quantity received for
              each item. Items not fully delivered will be marked as backorder
              or cancelled.
            </div>

            <div className='border rounded-lg overflow-hidden'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500'>
                      Part & Color
                    </th>
                    <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                      Ordered
                    </th>
                    <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                      Already Received
                    </th>
                    <th className='px-3 py-2 text-center text-xs font-medium text-gray-500'>
                      Receiving Now
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
                    const isFullyDelivered =
                      (item.quantity_already_delivered || 0) >=
                      item.quantity_ordered;

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className={
                            item.item_status === 'cancelled'
                              ? 'bg-red-50'
                              : isFullyDelivered
                                ? 'bg-green-50'
                                : ''
                          }
                        >
                          <td className='px-3 py-2'>
                            <p className='text-sm font-medium'>
                              {item.part_name}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {item.color_name}
                            </p>
                          </td>
                          <td className='px-3 py-2 text-center text-sm'>
                            {item.quantity_ordered}
                          </td>
                          <td className='px-3 py-2 text-center text-sm'>
                            <span
                              className={
                                item.quantity_already_delivered > 0
                                  ? 'text-green-600 font-medium'
                                  : 'text-gray-400'
                              }
                            >
                              {item.quantity_already_delivered || 0}
                            </span>
                          </td>
                          <td className='px-3 py-2 text-center'>
                            {isFullyDelivered ? (
                              <span className='text-green-600 text-sm'>
                                ✓ Complete
                              </span>
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
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                item.quantity_backorder > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'text-gray-400'
                              }`}
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
                              className={`text-xs px-2 py-1 rounded-full border-0 ${getItemStatusColor(
                                item.item_status,
                              )}`}
                              disabled={isFullyDelivered}
                            >
                              <option value='delivered'>Delivered</option>
                              <option value='partial'>Partial</option>
                              <option value='backorder'>Backorder</option>
                              <option value='cancelled'>Cancelled</option>
                            </select>
                          </td>
                        </tr>
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
                <p className='text-sm text-gray-600'>Total Ordered</p>
                <p className='text-xl font-bold text-gray-900'>
                  {deliveryItems.reduce(
                    (sum, item) => sum + item.quantity_ordered,
                    0,
                  )}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>Already Received</p>
                <p className='text-xl font-bold text-blue-600'>
                  {deliveryItems.reduce(
                    (sum, item) => sum + (item.quantity_already_delivered || 0),
                    0,
                  )}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>Receiving Now</p>
                <p className='text-xl font-bold text-green-600'>
                  {deliveryItems.reduce(
                    (sum, item) => sum + (item.quantity_receiving || 0),
                    0,
                  )}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-gray-600'>Remaining Backorder</p>
                <p className='text-xl font-bold text-orange-600'>
                  {deliveryItems.reduce(
                    (sum, item) => sum + item.quantity_backorder,
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
                Confirm Delivery (CHF {calculateDeliveryTotal().toFixed(2)})
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Order Details - ${orderDetails?.order_number}`}
        size='lg'
      >
        {orderDetails && (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg'>
              <div>
                <p className='text-xs text-gray-600'>Status</p>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    orderDetails.status,
                  )}`}
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
                <p className='font-semibold'>{orderDetails.created_by_name}</p>
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
                      Ordered
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
                          {item.part_name} - {item.color_name}
                        </td>
                        <td className='px-3 py-2 text-center text-sm'>
                          {item.quantity_ordered}
                        </td>
                        <td className='px-3 py-2 text-center text-sm text-green-600 font-medium'>
                          {item.quantity_delivered || 0}
                        </td>
                        <td className='px-3 py-2 text-center text-sm'>
                          {item.quantity_backorder > 0 && (
                            <span className='text-orange-600 font-medium'>
                              {item.quantity_backorder}
                            </span>
                          )}
                          {!item.quantity_backorder && '-'}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getItemStatusColor(
                              item.item_status,
                            )}`}
                          >
                            {formatStatus(item.item_status)}
                          </span>
                        </td>
                      </tr>
                      {item.notes && (
                        <tr className='bg-gray-50'>
                          <td
                            colSpan='5'
                            className='px-3 py-1 text-xs text-gray-600'
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
                <p className='text-sm font-medium text-gray-700 mb-1'>Notes</p>
                <div className='bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap max-h-40 overflow-y-auto'>
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
        message={`Are you sure you want to cancel order "${selectedOrder?.order_number}"?`}
      />
    </div>
  );
};

export default Orders;
