/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useEntityDetails } from '../../context/EntityDetailsContext';
import { ordersAPI } from '../../api/api';

const OrderDetails = ({ data, onRefetch, onClose }) => {
  const { openPartColor } = useEntityDetails();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        // Try to get order history if endpoint exists
        if (ordersAPI.getHistory) {
          const response = await ordersAPI.getHistory(data.id);
          setHistory(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch order history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (data?.id) {
      fetchHistory();
    }
  }, [data?.id]);

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
    return new Date(dateString).toLocaleString();
  };

  const totalOrdered =
    data.items?.reduce(
      (sum, i) => sum + (i.quantity_ordered || i.quantity || 0),
      0,
    ) || 0;
  const totalDelivered =
    data.items?.reduce((sum, i) => sum + (i.quantity_delivered || 0), 0) || 0;
  const totalBackorder =
    data.items?.reduce((sum, i) => sum + (i.quantity_backorder || 0), 0) || 0;

  return (
    <div className='space-y-6'>
      <div className='bg-gray-50 rounded-lg p-4'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Order Information
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Order Number</p>
            <p className='font-medium text-gray-900'>{data.order_number}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(data.status)}`}
            >
              {formatStatus(data.status)}
            </span>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Created By</p>
            <p className='font-medium text-gray-900'>
              {data.created_by_name || data.created_by_username || '-'}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Created At</p>
            <p className='font-medium text-gray-900'>
              {formatDate(data.created_at)}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Total Amount</p>
            <p className='text-xl font-bold text-gray-900'>
              CHF {parseFloat(data.total_amount || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='bg-blue-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-blue-600'>Total Ordered</p>
          <p className='text-2xl font-bold text-blue-700'>{totalOrdered}</p>
        </div>
        <div className='bg-green-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-green-600'>Delivered</p>
          <p className='text-2xl font-bold text-green-700'>{totalDelivered}</p>
        </div>
        <div className='bg-orange-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-orange-600'>Backorder</p>
          <p className='text-2xl font-bold text-orange-700'>{totalBackorder}</p>
        </div>
      </div>

      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>
          Order Items ({data.items?.length || 0})
        </h3>

        {!data.items || data.items.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No items in this order</p>
          </div>
        ) : (
          <div className='border rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Part
                  </th>
                  <th className='px-4 py-2 text-center text-xs font-medium text-gray-500'>
                    Ordered
                  </th>
                  <th className='px-4 py-2 text-center text-xs font-medium text-gray-500'>
                    Delivered
                  </th>
                  <th className='px-4 py-2 text-center text-xs font-medium text-gray-500'>
                    Backorder
                  </th>
                  <th className='px-4 py-2 text-center text-xs font-medium text-gray-500'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {data.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className='hover:bg-gray-50 cursor-pointer'
                      onClick={() => openPartColor(item.part_color_id)}
                    >
                      <td className='px-4 py-3'>
                        <p className='text-sm font-medium text-blue-600 hover:text-blue-800'>
                          {item.part_name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {item.color_name}
                        </p>
                      </td>
                      <td className='px-4 py-3 text-center text-sm'>
                        {item.quantity_ordered || item.quantity}
                      </td>
                      <td className='px-4 py-3 text-center text-sm text-green-600 font-medium'>
                        {item.quantity_delivered || 0}
                      </td>
                      <td className='px-4 py-3 text-center text-sm'>
                        {item.quantity_backorder > 0 ? (
                          <span className='text-orange-600 font-medium'>
                            {item.quantity_backorder}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getItemStatusColor(item.item_status)}`}
                        >
                          {formatStatus(item.item_status)}
                        </span>
                      </td>
                    </tr>
                    {item.notes && (
                      <tr className='bg-blue-50'>
                        <td
                          colSpan='5'
                          className='px-4 py-1 text-xs text-blue-700'
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
        )}
      </div>

      {history.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            Status History
          </h3>
          <div className='space-y-3'>
            {history.map((item) => (
              <div
                key={item.id}
                className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500'></div>
                <div className='flex-grow'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.old_status)}`}
                    >
                      {formatStatus(item.old_status)}
                    </span>
                    <span className='text-gray-400'>→</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.new_status)}`}
                    >
                      {formatStatus(item.new_status)}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    {formatDate(item.created_at)} by{' '}
                    {item.changed_by_name ||
                      item.changed_by_username ||
                      'System'}
                  </p>
                  {item.notes && (
                    <p className='text-sm text-gray-600 mt-1'>{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.notes && (
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            Order Notes
          </h3>
          <div className='bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-gray-700 max-h-48 overflow-y-auto'>
            {data.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
