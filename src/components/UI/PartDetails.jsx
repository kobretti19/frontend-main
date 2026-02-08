const PartDetails = ({ data, onRefetch, onClose }) => {
  const getStatusColor = (status) => {
    const statusColors = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  console.log(data, 'data');

  return (
    <div className='space-y-6'>
      <div className='bg-gray-50 rounded-lg p-4'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Part Information
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Name</p>
            <p className='font-medium text-gray-900'>{data.name}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Status</p>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(data.status)}`}
            >
              {data.status?.toUpperCase() || 'N/A'}
            </span>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Category</p>
            {data.category ? (
              <button className='font-medium text-blue-600 hover:text-blue-800 hover:underline'>
                {data.category}
              </button>
            ) : (
              <p className='text-gray-400'>-</p>
            )}
          </div>
          <div>
            <p className='text-sm text-gray-500'>Created</p>
            <p className='font-medium text-gray-900'>
              {data.created_at
                ? new Date(data.created_at).toLocaleDateString('en-GB')
                : '-'}
            </p>
          </div>
        </div>
        {data.description && (
          <div className='mt-4'>
            <p className='text-sm text-gray-500'>Description</p>
            <p className='text-gray-700'>{data.description}</p>
          </div>
        )}
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='bg-green-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-green-600'>Total Stock</p>
          <p className='text-2xl font-bold text-green-700'>{data?.quantity}</p>
        </div>
        <div className='bg-purple-50 rounded-lg p-4 text-center'>
          <p className='text-sm text-purple-600'>Total Value</p>
          <p className='text-2xl font-bold text-purple-700'>
            CHF {(data?.quantity * data?.purchase_price).toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        {!data ? (
          <div className='text-center py-8 text-gray-500'>
            Loading part details...
          </div>
        ) : data?.length === 0 ? (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-gray-500'>No colors assigned to this part</p>
          </div>
        ) : (
          <div className='border rounded-lg overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Color
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Purchase
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Selling
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Order Number
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                    Supplier
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {data ? (
                  <tr key={data.id} className='hover:bg-gray-50 '>
                    <td className='px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800'>
                      {data.color}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      CHF {parseFloat(data.purchase_price || 0).toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-sm text-green-600'>
                      CHF {parseFloat(data.selling_price || 0).toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold'>
                      {data.sku || 0}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(data.stock_status)}`}
                      >
                        {data.supplier || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ) : (
                  'Loading'
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartDetails;
