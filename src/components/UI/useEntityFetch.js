import { useState, useEffect, useCallback } from 'react';
import { partsAPI, equipmentAPI, ordersAPI } from '../../api/api';

const apiMap = {
  part: partsAPI,
  equipment: equipmentAPI,
  order: ordersAPI,
};

export const useEntityFetch = (entityType, entityId, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!entityType || !entityId) {
      setData(null);
      setLoading(false);
      return;
    }

    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    const api = apiMap[entityType];
    if (!api) {
      setError(`Unknown entity type: ${entityType}`);
      setLoading(false);
      return;
    }

    if (!api.getById) {
      setError(`API method getById not found for ${entityType}`);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.getById(entityId);
      setData(response.data.data);
    } catch (err) {
      console.error(`Failed to fetch ${entityType}:`, err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, initialData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useEntityFetch;
