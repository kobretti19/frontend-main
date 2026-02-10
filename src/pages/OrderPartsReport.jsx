import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/api';
import { LoadingSpinner, StatsCard, EmptyState } from '../components/Common';
import { useSearch } from '../context/SearchContext';

const OrderPartsReport = () => {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [parts, setParts] = useState([]);
  const [totals, setTotals] = useState({});
  const [backorderItems, setBackorderItems] = useState([]);
  const [backorderTotals, setBackorderTotals] = useState({});
  const [activeTab, setActiveTab] = useState('items');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryRes, backorderRes] = await Promise.all([
        ordersAPI.getPartsSummary(),
        ordersAPI.getBackorderParts(),
      ]);

      if (summaryRes.data.success) {
        setItems(summaryRes.data.data.items || []);
        setParts(summaryRes.data.data.parts || []);
        setTotals(summaryRes.data.data.totals || {});
      }

      if (backorderRes.data.success) {
        setBackorderItems(backorderRes.data.data || []);
        setBackorderTotals(backorderRes.data.totals || {});
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.part_color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order_number?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by item_status instead of order_status
    if (filterStatus && item.item_status !== filterStatus) return false;

    return true;
  });

  // Filter parts
  const filteredParts = parts.filter((part) => {
    return (
      part.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.part_color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter backorder
  const filteredBackorder = backorderItems.filter((item) => {
    return (
      item.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.part_color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-CH');
  };

  // Updated to include both order and item statuses
  const getStatusColor = (status) => {
    const colors = {
      // Order statuses
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      ordered: 'bg-purple-100 text-purple-800',
      // Item statuses
      delivered: 'bg-green-100 text-green-800',
      partial: 'bg-orange-100 text-orange-800',
      backorder: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner />;

  console.log(filteredItems,"filteredOrderPartsReport")

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Controls */}
      <div className='print:hidden bg-white shadow-sm border-b sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => navigate('/orders')}
                className='text-gray-600 hover:text-gray-900'
              >
                ← Back to Orders
              </button>
              <h1 className='text-xl font-bold text-gray-900'>Order Parts Report</h1>
            </div>
            <button onClick={handlePrint} className='btn-primary'>
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto py-6 px-4'>
        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
          <StatsCard label='Total Items' value={totals.total_items || 0} color='gray' />
          <StatsCard label='Total Ordered' value={totals.total_ordered || 0} color='blue' />
          <StatsCard label='Delivered' value={totals.total_delivered || 0} color='green' />
          <StatsCard label='Backorder' value={totals.total_backorder || 0} color='red' />
          <StatsCard
            label='Total Value'
            value={`CHF ${(totals.total_value || 0).toFixed(2)}`}
            color='purple'
          />
        </div>

        {/* Tabs */}
        <div className='mb-6 border-b border-gray-200 print:hidden'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Order Items ({filteredItems.length})
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'parts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Parts Summary ({filteredParts.length})
            </button>
            <button
              onClick={() => setActiveTab('backorder')}
              className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'backorder'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Backorder
              {backorderItems.length > 0 && (
                <span className='ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                  {backorderItems.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'items' && (
          <div className='card mb-6 print:hidden'>
            <div className='flex items-center gap-4'>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='input-field'
              >
                <option value=''>All Status</option>
                <option value='pending'>Pending</option>
                <option value='delivered'>Delivered</option>
                <option value='partial'>Partial</option>
                <option value='backorder'>Backorder</option>
                <option value='cancelled'>Cancelled</option>
              </select>
              {filterStatus && (
                <button onClick={() => setFilterStatus('')} className='btn-secondary'>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* All Order Items Tab */}
        {activeTab === 'items' && (
          <div className='card overflow-hidden'>
            {filteredItems.length === 0 ? (
              <EmptyState
                icon='📦'
                title='No Items'
                message='No order items found'
                hasItems={items.length > 0}
              />
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Order
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Date
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Part
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        SKU
                      </th>
                      <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                        Ordered
                      </th>
                      <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                        Delivered
                      </th>
                      <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                        Backorder
                      </th>
                      <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                        Stock
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Item Status
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Order Status
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        By
                      </th>
                      <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredItems.map((item, index) => (
                      <tr
                        key={`${item.order_item_id}-${index}`}
                        className={`hover:bg-gray-50 ${
                          item.quantity_backorder > 0 ? 'bg-red-50' : ''
                        } ${item.item_status === 'delivered' ? 'bg-green-50' : ''}`}
                      >
                        <td className='px-3 py-2 text-sm font-medium text-blue-600'>
                          {item.order_number}
                        </td>
                        <td className='px-3 py-2 text-sm text-gray-600'>
                          {formatDate(item.order_date)}
                        </td>
                        <td className='px-3 py-2'>
                          <p className='text-sm font-medium text-gray-900'>
                            {item.part_name}
                          </p>
                          {item.part_color && (
                            <p className='text-xs text-gray-500'>{item.part_color}</p>
                          )}
                        </td>
                        <td className='px-3 py-2 text-sm text-gray-500 font-mono'>
                          {item.sku || '-'}
                        </td>
                        <td className='px-3 py-2 text-center text-sm font-medium text-blue-600'>
                          {item.quantity_ordered || 0}
                        </td>
                        <td className='px-3 py-2 text-center text-sm font-medium text-green-600'>
                          {item.quantity_delivered || 0}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          {item.quantity_backorder > 0 ? (
                            <span className='px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold'>
                              {item.quantity_backorder}
                            </span>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </td>
                        <td className='px-3 py-2 text-center'>
                          <span
                            className={`text-sm font-medium ${
                              item.current_stock <= (item.min_stock_level || 5)
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {item.current_stock || 0}
                          </span>
                        </td>
                        {/* Item Status - Shows delivered/partial/backorder per item */}
                        <td className='px-3 py-2'>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              item.item_status
                            )}`}
                          >
                            {item.item_status || '-'}
                          </span>
                        </td>
                        {/* Order Status - Shows overall order status */}
                        <td className='px-3 py-2'>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              item.order_status
                            )}`}
                          >
                            {item.order_status || '-'}
                          </span>
                        </td>
                        <td className='px-3 py-2 text-sm text-gray-600'>
                          {item.ordered_by || '-'}
                        </td>
                        <td className='px-3 py-2 text-sm text-gray-500 max-w-xs truncate'>
                          {item.item_notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className='bg-gray-100'>
                    <tr className='font-semibold'>
                      <td colSpan='4' className='px-3 py-2 text-right'>
                        Totals:
                      </td>
                      <td className='px-3 py-2 text-center text-blue-600'>
                        {filteredItems.reduce(
                          (sum, i) => sum + (i.quantity_ordered || 0),
                          0
                        )}
                      </td>
                      <td className='px-3 py-2 text-center text-green-600'>
                        {filteredItems.reduce(
                          (sum, i) => sum + (i.quantity_delivered || 0),
                          0
                        )}
                      </td>
                      <td className='px-3 py-2 text-center text-red-600'>
                        {filteredItems.reduce(
                          (sum, i) => sum + (i.quantity_backorder || 0),
                          0
                        )}
                      </td>
                      <td colSpan='5'></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Parts Summary Tab */}
        {activeTab === 'parts' && (
          <div className='card overflow-hidden'>
            {filteredParts.length === 0 ? (
              <EmptyState
                icon='📦'
                title='No Parts'
                message='No parts found'
                hasItems={parts.length > 0}
              />
            ) : (
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Part
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      SKU
                    </th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Stock
                    </th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Total Ordered
                    </th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Delivered
                    </th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Backorder
                    </th>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredParts.map((part) => (
                    <tr
                      key={part.part_id}
                      className={`hover:bg-gray-50 ${
                        part.total_backorder > 0 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className='px-4 py-3'>
                        <p className='text-sm font-medium text-gray-900'>
                          {part.part_name}
                        </p>
                        {part.part_color && (
                          <p className='text-xs text-gray-500'>{part.part_color}</p>
                        )}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-500 font-mono'>
                        {part.sku || '-'}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <span
                          className={`text-sm font-medium ${
                            part.current_stock <= (part.min_stock_level || 5)
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {part.current_stock || 0}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-center text-sm font-medium text-blue-600'>
                        {part.total_ordered || 0}
                      </td>
                      <td className='px-4 py-3 text-center text-sm font-medium text-green-600'>
                        {part.total_delivered || 0}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        {part.total_backorder > 0 ? (
                          <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold'>
                            {part.total_backorder}
                          </span>
                        ) : (
                          <span className='text-gray-400'>-</span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-center text-sm text-gray-600'>
                        {part.order_count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className='bg-gray-100'>
                  <tr className='font-semibold'>
                    <td colSpan='3' className='px-4 py-2 text-right'>
                      Totals:
                    </td>
                    <td className='px-4 py-2 text-center text-blue-600'>
                      {filteredParts.reduce(
                        (sum, p) => sum + (p.total_ordered || 0),
                        0
                      )}
                    </td>
                    <td className='px-4 py-2 text-center text-green-600'>
                      {filteredParts.reduce(
                        (sum, p) => sum + (p.total_delivered || 0),
                        0
                      )}
                    </td>
                    <td className='px-4 py-2 text-center text-red-600'>
                      {filteredParts.reduce(
                        (sum, p) => sum + (p.total_backorder || 0),
                        0
                      )}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {/* Backorder Tab */}
        {activeTab === 'backorder' && (
          <div className='card overflow-hidden'>
            {filteredBackorder.length === 0 ? (
              <EmptyState
                icon='✅'
                title='No Backorders'
                message='All items delivered'
                hasItems={false}
              />
            ) : (
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Order
                    </th>
                    <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Date
                    </th>
                    <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Part
                    </th>
                    <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      SKU
                    </th>
                    <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Ordered
                    </th>
                    <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Delivered
                    </th>
                    <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Backorder
                    </th>
                    <th className='px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                      Stock
                    </th>
                    <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Status
                    </th>
                    <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      By
                    </th>
                    <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredBackorder.map((item, index) => (
                    <tr
                      key={`${item.order_item_id}-${index}`}
                      className='hover:bg-gray-50 bg-red-50'
                    >
                      <td className='px-3 py-2'>
                        <span className='text-sm font-medium text-blue-600'>
                          {item.order_number}
                        </span>
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-600'>
                        {formatDate(item.order_date)}
                      </td>
                      <td className='px-3 py-2'>
                        <p className='text-sm font-medium text-gray-900'>
                          {item.part_name}
                        </p>
                        {item.part_color && (
                          <p className='text-xs text-gray-500'>{item.part_color}</p>
                        )}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-500 font-mono'>
                        {item.sku || '-'}
                      </td>
                      <td className='px-3 py-2 text-center text-sm'>
                        {item.quantity_ordered}
                      </td>
                      <td className='px-3 py-2 text-center text-sm text-green-600'>
                        {item.quantity_delivered}
                      </td>
                      <td className='px-3 py-2 text-center'>
                        <span className='px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold'>
                          {item.quantity_backorder}
                        </span>
                      </td>
                      <td className='px-3 py-2 text-center text-sm'>
                        {item.current_stock || 0}
                      </td>
                      <td className='px-3 py-2'>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            item.item_status
                          )}`}
                        >
                          {item.item_status || '-'}
                        </span>
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-600'>
                        {item.ordered_by || '-'}
                      </td>
                      <td className='px-3 py-2 text-sm text-gray-500 max-w-xs truncate'>
                        {item.item_notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className='bg-gray-100'>
                  <tr className='font-semibold'>
                    <td colSpan='4' className='px-3 py-2 text-right'>
                      Totals:
                    </td>
                    <td className='px-3 py-2 text-center'>
                      {filteredBackorder.reduce(
                        (sum, i) => sum + (i.quantity_ordered || 0),
                        0
                      )}
                    </td>
                    <td className='px-3 py-2 text-center text-green-600'>
                      {filteredBackorder.reduce(
                        (sum, i) => sum + (i.quantity_delivered || 0),
                        0
                      )}
                    </td>
                    <td className='px-3 py-2 text-center text-red-600'>
                      {filteredBackorder.reduce(
                        (sum, i) => sum + (i.quantity_backorder || 0),
                        0
                      )}
                    </td>
                    <td colSpan='4'></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderPartsReport;