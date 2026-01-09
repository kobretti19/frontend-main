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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
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
  const [statusData, setStatusData] = useState({
    status: '',
    notes: '',
  });

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
      (pc) => pc.id === parseInt(currentItem.part_color_id)
    );

    if (!partColor) {
      alert('Part color not found');
      return;
    }

    const exists = formData.items.find(
      (item) => item.part_color_id === parseInt(currentItem.part_color_id)
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
          notes: currentItem.notes,
          part_name: partColor.part_name,
          color_name: partColor.color_name,
          purchase_price: partColor.purchase_price || 0,
          selling_price: partColor.selling_price || 0,
        },
      ],
    });

    setCurrentItem({ part_color_id: '', quantity: 1, notes: '' });
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

  const handleOpenStatusModal = async (order) => {
    try {
      // Fetch full order details to get items
      const response = await ordersAPI.getById(order.id);
      const fullOrder = response.data.data;

      setSelectedOrder(fullOrder);
      setEditableItems(
        fullOrder.items?.map((item) => ({
          ...item,
          quantity: item.quantity,
        })) || []
      );
      setStatusData({ status: order.status, notes: '' });
      setShowStatusModal(true);
    } catch (err) {
      alert(`Failed to load order: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    try {
      // Prepare items data for delivery
      const itemsPayload = editableItems.map((item) => ({
        id: item.id,
        part_color_id: item.part_color_id,
        quantity: parseInt(item.quantity),
      }));

      await dispatch(
        updateOrderStatus({
          id: selectedOrder.id,
          status: statusData.status,
          notes: statusData.notes,
          items: itemsPayload,
        })
      ).unwrap();

      setShowStatusModal(false);
      setSelectedOrder(null);
      setEditableItems([]);
      setStatusData({ status: '', notes: '' });
      dispatch(fetchOrders());
      dispatch(fetchOrderStats());
      dispatch(fetchPartsColors());
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
      0
    );
  };

  const calculateEditableTotal = () => {
    return editableItems.reduce(
      (total, item) =>
        total + (parseFloat(item.purchase_price_at_order) || 0) * item.quantity,
      0
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
      <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-6'>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Total Orders</p>
          <p className='text-3xl font-bold text-gray-900 mt-2'>
            {stats?.overall?.total_orders || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Waiting</p>
          <p className='text-3xl font-bold text-yellow-600 mt-2'>
            {stats?.overall?.waiting_for_answer || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Ordered</p>
          <p className='text-3xl font-bold text-purple-600 mt-2'>
            {stats?.overall?.ordered || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Delivered</p>
          <p className='text-3xl font-bold text-green-600 mt-2'>
            {stats?.overall?.delivered || 0}
          </p>
        </div>
        <div className='card'>
          <p className='text-sm font-medium text-gray-600'>Filtered</p>
          <p className='text-3xl font-bold text-blue-600 mt-2'>
            {filteredOrders.length}
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
              <option value='waiting_for_answer'>Waiting for Answer</option>
              <option value='to_order'>To Order</option>
              <option value='ordered'>Ordered</option>
              <option value='delivered'>Delivered</option>
              <option value='cancelled'>Cancelled</option>
            </select>

            {filterStatus && (
              <button
                onClick={() => setFilterStatus('')}
                className='btn-secondary whitespace-nowrap'
              >
                Clear Filter
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
              : 'Try adjusting your search or filter'}
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
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Order Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Items
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Total
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Created
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredOrders.map((order) => (
                <tr key={order.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <p className='text-sm font-medium text-gray-900'>
                      {order.order_number}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {order.created_by_name || order.created_by_username}
                    </p>
                  </td>
                  <td className='px-6 py-4'>
                    <p className='text-sm text-gray-600 max-w-xs truncate'>
                      {order.items_summary || `${order.total_items} items`}
                    </p>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <p className='text-sm font-semibold text-gray-900'>
                      CHF {parseFloat(order.total_amount || 0).toFixed(2)}
                    </p>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(order.created_at)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className='text-purple-600 hover:text-purple-900'
                    >
                      View
                    </button>
                    {order.status !== 'delivered' &&
                      order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className='text-blue-600 hover:text-blue-900'
                        >
                          Update
                        </button>
                      )}
                    {order.status !== 'delivered' && (
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
          setCurrentItem({ part_color_id: '', quantity: 1, notes: '' });
        }}
        title='Create New Order'
        size='lg'
      >
        <form onSubmit={handleCreate}>
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Order Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className='input-field'
                rows='2'
                placeholder='Add notes for this order...'
              />
            </div>

            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Add Items *{' '}
                <span className='text-sm text-gray-500 font-normal'>
                  ({formData.items.length} added)
                </span>
              </h3>
              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                <div className='grid grid-cols-4 gap-3 mb-3'>
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
                <input
                  type='text'
                  value={currentItem.notes}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, notes: e.target.value })
                  }
                  className='input-field'
                  placeholder='Item notes (optional)'
                />
              </div>

              {formData.items.length > 0 ? (
                <div className='border rounded-lg overflow-hidden'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Part & Color
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Qty
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Price
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                          Subtotal
                        </th>
                        <th className='px-4 py-2 text-right text-xs font-medium text-gray-500'>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td className='px-4 py-2 text-sm'>
                            {item.part_name} - {item.color_name}
                          </td>
                          <td className='px-4 py-2 text-sm'>
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
                              className='w-20 input-field'
                            />
                          </td>
                          <td className='px-4 py-2 text-sm'>
                            CHF{' '}
                            {parseFloat(item.purchase_price || 0).toFixed(2)}
                          </td>
                          <td className='px-4 py-2 text-sm font-medium'>
                            CHF{' '}
                            {(
                              parseFloat(item.purchase_price || 0) *
                              item.quantity
                            ).toFixed(2)}
                          </td>
                          <td className='px-4 py-2 text-sm text-right'>
                            <button
                              type='button'
                              onClick={() => removeItemFromList(index)}
                              className='text-red-600 hover:text-red-900'
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className='bg-gray-50'>
                        <td
                          colSpan='3'
                          className='px-4 py-3 text-right font-semibold'
                        >
                          Total:
                        </td>
                        <td className='px-4 py-3 font-bold text-lg'>
                          CHF {calculateTotal(formData.items).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                  <p className='text-gray-500'>No items added yet</p>
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
                Create Order (CHF {calculateTotal(formData.items).toFixed(2)})
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
          <div className='space-y-6'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg'>
              <div>
                <p className='text-sm text-gray-600'>Status</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    orderDetails.status
                  )}`}
                >
                  {formatStatus(orderDetails.status)}
                </span>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Created</p>
                <p className='font-semibold'>
                  {formatDate(orderDetails.created_at)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Created By</p>
                <p className='font-semibold'>
                  {orderDetails.created_by_name ||
                    orderDetails.created_by_username}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Total Amount</p>
                <p className='text-xl font-bold text-gray-900'>
                  CHF {parseFloat(orderDetails.total_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {orderDetails.notes && (
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  Order Notes
                </h3>
                <div className='bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto'>
                  <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                    {orderDetails.notes}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                Order Items ({orderDetails.items?.length || 0})
              </h3>
              <div className='border rounded-lg overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Part & Color
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Qty
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Purchase
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Selling
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {orderDetails.items?.map((item) => (
                      <tr key={item.id}>
                        <td className='px-4 py-3 text-sm font-medium'>
                          {item.part_name} - {item.color_name}
                        </td>
                        <td className='px-4 py-3 text-sm'>{item.quantity}</td>
                        <td className='px-4 py-3 text-sm'>
                          CHF{' '}
                          {parseFloat(
                            item.purchase_price_at_order || 0
                          ).toFixed(2)}
                        </td>
                        <td className='px-4 py-3 text-sm text-green-600'>
                          CHF{' '}
                          {parseFloat(item.current_selling_price || 0).toFixed(
                            2
                          )}
                        </td>
                        <td className='px-4 py-3 text-sm font-semibold'>
                          CHF{' '}
                          {(
                            item.quantity *
                            parseFloat(item.purchase_price_at_order || 0)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
          setEditableItems([]);
        }}
        title='Update Order Status'
        size='lg'
      >
        <form onSubmit={handleUpdateStatus}>
          <div className='space-y-5'>
            {/* Order Info */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='text-sm text-gray-600'>Order Number</p>
                  <p className='text-lg font-semibold'>
                    {selectedOrder?.order_number}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-gray-600'>Current Status</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      selectedOrder?.status
                    )}`}
                  >
                    {formatStatus(selectedOrder?.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Items */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Order Items{' '}
                {statusData.status === 'delivered' && (
                  <span className='text-red-500'>
                    (Verify quantities before delivery)
                  </span>
                )}
              </label>
              <div className='border rounded-lg overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-2 text-xs text-left font-medium text-gray-500'>
                        Part & Color
                      </th>
                      <th className='px-4 py-2 text-xs text-left font-medium text-gray-500'>
                        Quantity
                      </th>
                      <th className='px-4 py-2 text-xs text-left font-medium text-gray-500'>
                        Price
                      </th>
                      <th className='px-4 py-2 text-xs text-left font-medium text-gray-500'>
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {editableItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className='px-4 py-2 text-sm'>
                          {item.part_name} - {item.color_name}
                        </td>
                        <td className='px-4 py-2'>
                          <input
                            type='number'
                            min='1'
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...editableItems];
                              updated[index].quantity =
                                parseInt(e.target.value) || 1;
                              setEditableItems(updated);
                            }}
                            className='w-24 input-field'
                          />
                        </td>
                        <td className='px-4 py-2 text-sm'>
                          CHF{' '}
                          {parseFloat(
                            item.purchase_price_at_order || 0
                          ).toFixed(2)}
                        </td>
                        <td className='px-4 py-2 text-sm font-medium'>
                          CHF{' '}
                          {(
                            item.quantity *
                            parseFloat(item.purchase_price_at_order || 0)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className='bg-gray-50'>
                      <td
                        colSpan='3'
                        className='px-4 py-2 text-right font-semibold'
                      >
                        Total:
                      </td>
                      <td className='px-4 py-2 font-bold'>
                        CHF {calculateEditableTotal().toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* New Status */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                New Status
              </label>
              <select
                value={statusData.status}
                onChange={(e) =>
                  setStatusData({ ...statusData, status: e.target.value })
                }
                className='input-field'
                required
              >
                <option value='waiting_for_answer'>Waiting for Answer</option>
                <option value='to_order'>To Order</option>
                <option value='ordered'>Ordered</option>
                <option value='delivered'>
                  Delivered (Stock will be added)
                </option>
              </select>
              {statusData.status === 'delivered' && (
                <p className='mt-2 text-sm text-green-600 bg-green-50 p-2 rounded'>
                  ⚠️ Setting status to "Delivered" will add the quantities above
                  to your stock inventory.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Status Update Notes
              </label>
              <textarea
                value={statusData.notes}
                onChange={(e) =>
                  setStatusData({ ...statusData, notes: e.target.value })
                }
                className='input-field'
                rows='2'
                placeholder='Add notes about this status change...'
              />
            </div>

            {/* Actions */}
            <div className='flex justify-end space-x-3 pt-4 border-t'>
              <button
                type='button'
                onClick={() => setShowStatusModal(false)}
                className='btn-secondary'
              >
                Cancel
              </button>
              <button type='submit' className='btn-primary'>
                Update Order
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title='Cancel Order'
        message={`Are you sure you want to cancel order "${selectedOrder?.order_number}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Orders;