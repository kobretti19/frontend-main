import React, { useEffect } from 'react';
import { useEntityDetails } from '../../context/EntityDetailsContext';
import { useEntityFetch } from './useEntityFetch';
import PartDetails from './PartDetails';
import EquipmentDetails from './EquipmentDetails';
import OrderDetails from './OrderDetails';

const detailComponentMap = {
  part: PartDetails,
  equipment: EquipmentDetails,
  order: OrderDetails,
};

const entityLabels = {
  part: 'Part',
  part_color: 'Part Color',
  equipment: 'Equipment',
  order: 'Order',
  color: 'Color',
  category: 'Category',
  brand: 'Brand',
};

// Simple inline loading spinner
const LoadingSpinner = () => (
  <div className='flex items-center justify-center'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
  </div>
);

const DetailDrawer = () => {
  const { isOpen, entityType, entityId, entityData, close } =
    useEntityDetails();
  const { data, loading, error, refetch } = useEntityFetch(
    entityType,
    entityId,
    entityData,
  );

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') close();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, close]);

  const DetailComponent = entityType ? detailComponentMap[entityType] : null;
  const label = entityType ? entityLabels[entityType] : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b bg-gray-50'>
          <div>
            <p className='text-sm text-gray-500'>{label} Details</p>
            <h2 className='text-xl font-bold text-gray-900'>
              {data?.name ||
                data?.order_number ||
                data?.model ||
                `#${entityId}`}
            </h2>
          </div>
          <button
            onClick={close}
            className='p-2 hover:bg-gray-200 rounded-full transition-colors'
          >
            <svg
              className='w-6 h-6 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto h-[calc(100%-80px)]'>
          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>❌</div>
              <p className='text-xl font-semibold text-gray-900 mb-2'>
                Error Loading {label}
              </p>
              <p className='text-gray-500 mb-4'>{error}</p>
              <button onClick={refetch} className='btn-primary'>
                Try Again
              </button>
            </div>
          ) : !data ? (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🔍</div>
              <p className='text-xl font-semibold text-gray-900'>
                No Data Found
              </p>
            </div>
          ) : DetailComponent ? (
            <DetailComponent data={data} onRefetch={refetch} onClose={close} />
          ) : (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🚧</div>
              <p className='text-xl font-semibold text-gray-900'>
                Unknown Entity Type: {entityType}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DetailDrawer;
