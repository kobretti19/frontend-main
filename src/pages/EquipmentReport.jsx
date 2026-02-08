import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipment } from '../redux/slices/equipmentSlice';
import { LoadingSpinner } from '../components/Common';
import { useNavigate } from 'react-router-dom';

const EquipmentReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const printRef = useRef();

  const { items: equipment, loading } = useSelector((state) => state.equipment);

  // Filters
  const [groupBy, setGroupBy] = useState('week'); // week, month, year
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [filterMonth, setFilterMonth] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    dispatch(fetchEquipment());
  }, [dispatch]);

  // Helpers
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const getWeekDateRange = (weekNum, year) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNum - 1) * 7;
    const firstDayOfWeek = new Date(firstDayOfYear);
    firstDayOfWeek.setDate(
      firstDayOfYear.getDate() + daysOffset - firstDayOfYear.getDay() + 1,
    );
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    return `${firstDayOfWeek.toLocaleDateString('de-CH')} - ${lastDayOfWeek.toLocaleDateString('de-CH')}`;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Filter equipment
  const filteredEquipment = equipment.filter((item) => {
    const itemDate = new Date(item.created_at);
    if (filterYear && itemDate.getFullYear().toString() !== filterYear)
      return false;
    if (filterMonth && (itemDate.getMonth() + 1).toString() !== filterMonth)
      return false;
    if (filterBrand && item.brand !== filterBrand) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    return true;
  });

  // Group equipment
  const groupEquipment = () => {
    const groups = {};
    filteredEquipment.forEach((item) => {
      const date = new Date(item.created_at);
      let groupKey;
      let groupLabel;

      if (groupBy === 'week') {
        const weekNum = getWeekNumber(date);
        const year = date.getFullYear();
        groupKey = `${year}-W${weekNum.toString().padStart(2, '0')}`;
        groupLabel = `Week ${weekNum}, ${year} (${getWeekDateRange(weekNum, year)})`;
      } else if (groupBy === 'month') {
        const month = date.getMonth();
        const year = date.getFullYear();
        groupKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        groupLabel = `${monthNames[month]} ${year}`;
      } else {
        const year = date.getFullYear();
        groupKey = year.toString();
        groupLabel = year.toString();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          label: groupLabel,
          items: [],
          totalParts: 0,
        };
      }
      groups[groupKey].items.push(item);
      groups[groupKey].totalParts += item.parts_count || 0;
    });
    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  };

  const groupedData = groupEquipment();

  // Summarize by model
  const summarizeGroup = (items) => {
    const summary = {};
    items.forEach((item) => {
      const key = `${item.model}-${item.brand || 'N/A'}-${item.category || 'N/A'}`;
      if (!summary[key]) {
        summary[key] = {
          model: item.model,
          brand: item.brand || '-',
          category: item.category || '-',
          count: 0,
          serials: [],
        };
      }
      summary[key].count++;
      if (item.serial_number) {
        summary[key].serials.push(item.serial_number);
      }
    });
    return Object.values(summary).sort((a, b) => b.count - a.count);
  };

  // Get unique values for filters
  const uniqueBrands = [
    ...new Set(equipment.filter((e) => e.brand).map((e) => e.brand)),
  ].sort();
  const uniqueCategories = [
    ...new Set(equipment.filter((e) => e.category).map((e) => e.category)),
  ].sort();
  const uniqueYears = [
    ...new Set(equipment.map((e) => new Date(e.created_at).getFullYear())),
  ].sort((a, b) => b - a);

  const handlePrint = () => {
    window.print();
  };

  const totalEquipment = filteredEquipment.length;
  const totalParts = filteredEquipment.reduce(
    (sum, e) => sum + (e.parts_count || 0),
    0,
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* --- REFINED CENTERED NAVIGATION MENU --- */}
      <div className='print:hidden bg-white shadow-sm border-b sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={() => navigate('/equipment')}
              className='text-gray-600 hover:text-gray-900'
            >
              ← Back to Equipment
            </button>
            <h1 className='text-xl font-bold text-gray-900'>
              Equipment Report
            </h1>
            <div className='w-24'></div>
          </div>

          <div className='flex flex-row items-center justify-center gap-3 w-full'>
            {/* Group By */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className='border border-gray-300 rounded px-3 py-1.5 text-sm outline-none'
            >
              <option value='week'>Week</option>
              <option value='month'>Month</option>
              <option value='year'>Year</option>
            </select>

            {/* Year Filter */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className='border border-gray-300 rounded px-3 py-1.5 text-sm outline-none'
            >
              <option value=''>All Years</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Month Filter */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className='border border-gray-300 rounded px-3 py-1.5 text-sm outline-none'
            >
              <option value=''>All Months</option>
              {monthNames.map((m, i) => (
                <option key={i} value={(i + 1).toString()}>
                  {m}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className='border border-gray-300 rounded px-3 py-1.5 text-sm outline-none'
            >
              <option value=''>All Brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className='border border-gray-300 rounded px-3 py-1.5 text-sm outline-none'
            >
              <option value=''>All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filterMonth || filterBrand || filterCategory) && (
              <button
                onClick={() => {
                  setFilterMonth('');
                  setFilterBrand('');
                  setFilterCategory('');
                }}
                className='px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded'
              >
                Clear
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className='px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700'
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {/* --- ORIGINAL A4 DESIGN CONTENT --- */}
      <div className='max-w-4xl mx-auto py-8 px-4 print:py-0 print:px-0 print:max-w-none'>
        <div
          ref={printRef}
          className='bg-white shadow-lg print:shadow-none'
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '15mm',
            margin: '0 auto',
          }}
        >
          {/* Report Header */}
          <div className='border-b-2 border-gray-800 pb-4 mb-6'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Equipment Production Report
                </h1>
                <p className='text-gray-600 mt-1'>
                  {filterYear || 'All Years'}
                  {filterMonth && ` - ${monthNames[parseInt(filterMonth) - 1]}`}
                  {filterBrand && ` - ${filterBrand}`}
                  {filterCategory && ` - ${filterCategory}`}
                </p>
              </div>
              <div className='text-right text-sm text-gray-600'>
                <p>Generated: {new Date().toLocaleDateString('de-CH')}</p>
                <p>
                  Grouped by:{' '}
                  {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className='grid grid-cols-4 gap-4 mb-6'>
            <div className='bg-gray-100 p-3 rounded text-center'>
              <p className='text-xs text-gray-600 uppercase'>Total Equipment</p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalEquipment}
              </p>
            </div>
            <div className='bg-blue-100 p-3 rounded text-center'>
              <p className='text-xs text-blue-600 uppercase'>
                Total Parts Used
              </p>
              <p className='text-2xl font-bold text-blue-900'>{totalParts}</p>
            </div>
            <div className='bg-green-100 p-3 rounded text-center'>
              <p className='text-xs text-green-600 uppercase'>Groups</p>
              <p className='text-2xl font-bold text-green-900'>
                {groupedData.length}
              </p>
            </div>
            <div className='bg-purple-100 p-3 rounded text-center'>
              <p className='text-xs text-purple-600 uppercase'>Unique Models</p>
              <p className='text-2xl font-bold text-purple-900'>
                {new Set(filteredEquipment.map((e) => e.model)).size}
              </p>
            </div>
          </div>

          {/* Grouped Data */}
          {groupedData.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              <p className='text-xl'>
                No equipment found for the selected filters
              </p>
            </div>
          ) : (
            <div className='space-y-6'>
              {groupedData.map((group) => {
                const summary = summarizeGroup(group.items);
                return (
                  <div
                    key={group.key}
                    className='border border-gray-300 rounded-lg overflow-hidden'
                  >
                    <div className='bg-gray-800 text-white px-4 py-2 flex justify-between items-center'>
                      <h2 className='font-semibold'>{group.label}</h2>
                      <div className='text-sm'>
                        <span className='bg-white text-gray-800 px-2 py-1 rounded mr-2'>
                          {group.items.length} units
                        </span>
                        <span className='bg-blue-500 text-white px-2 py-1 rounded'>
                          {group.totalParts} parts
                        </span>
                      </div>
                    </div>

                    <table className='w-full text-sm'>
                      <thead className='bg-gray-100'>
                        <tr>
                          <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                            Model
                          </th>
                          <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                            Brand
                          </th>
                          <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                            Category
                          </th>
                          <th className='px-3 py-2 text-center font-semibold text-gray-700'>
                            Qty
                          </th>
                          <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                            Serial Numbers
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {summary.map((row, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }
                          >
                            <td className='px-3 py-2 font-medium'>
                              {row.model}
                            </td>
                            <td className='px-3 py-2'>{row.brand}</td>
                            <td className='px-3 py-2'>{row.category}</td>
                            <td className='px-3 py-2 text-center font-bold'>
                              {row.count}
                            </td>
                            <td className='px-3 py-2 text-xs text-gray-600'>
                              {row.serials.length > 0
                                ? row.serials.join(', ')
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className='bg-gray-200'>
                        <tr>
                          <td
                            colSpan='3'
                            className='px-3 py-2 font-semibold text-right'
                          >
                            Subtotal:
                          </td>
                          <td className='px-3 py-2 text-center font-bold'>
                            {group.items.length}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* Report Footer */}
          <div className='mt-8 pt-4 border-t border-gray-300 text-sm text-gray-600 flex justify-between'>
            <p>Dynavox Equipment Management System</p>
            <p>Page 1 of 1</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default EquipmentReport;
