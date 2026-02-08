import React, { useState, useEffect } from 'react';
import { useEntityDetails } from '../../context/EntityDetailsContext';
import { equipmentAPI } from '../../api/api';

const EquipmentDetails = ({ data, onRefetch, onClose }) => {
  const { openPart } = useEntityDetails();
  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoadingParts(true);
        const response = await equipmentAPI.getById(data.id);
        setParts(response.data.data?.parts || []);
      } catch (err) {
        console.error('Failed to fetch equipment parts:', err);
        setParts([]);
      } finally {
        setLoadingParts(false);
      }
    };

    if (data?.id) {
      fetchParts();
    }
  }, [data?.id]);

  const getStatusColor = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      retired: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='space-y-6'>
      <div className='bg-gray-50 rounded-lg p-4'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Equipment Information
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Model</p>
            <p className='font-medium text-gray-900'>{data.model || '-'}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(data.status)}`}
            >
              {data.status?.toUpperCase() || 'ACTIVE'}
            </span>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Category</p>
            <p className='font-medium text-gray-900'>{data.category || '-'}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Brand</p>
            <p className='font-medium text-gray-900'>{data.brand || '-'}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Serial Number</p>
            <p className='font-medium text-gray-900'>
              {data.serial_number || '-'}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Article ID</p>
            <p className='font-medium text-gray-900'>
              {data.article_id || '-'}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Created From Template</p>
            <p className='font-medium text-gray-900'>
              {data.created_from_template || '-'}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Production Date</p>
            <p className='font-medium text-gray-900'>
              {data.production_date
                ? new Date(data.production_date).toLocaleDateString()
                : '-'}
            </p>
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
              {data.created_at
                ? new Date(data.created_at).toLocaleDateString()
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Parts List */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>
          Parts Used ({parts.length})
        </h3>

        {loadingParts ? (
          <div className='text-center py-8 text-gray-500'>Loading parts...</div>
        ) : parts.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No parts recorded</p>
          </div>
        ) : (
          <div className='border rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Part
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Color
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    SKU
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Qty Used
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {parts.map((part, index) => (
                  <tr
                    key={part.id || index}
                    className='hover:bg-gray-50 cursor-pointer'
                    onClick={() => openPart && openPart(part.part_id)}
                  >
                    <td className='px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800'>
                      {part.part_name || part.name}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-700'>
                      {part.part_color || part.color || '-'}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500 font-mono'>
                      {part.part_sku || part.sku || '-'}
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold'>
                      {part.quantity_needed || 1}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {part.part_notes || part.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetails;
