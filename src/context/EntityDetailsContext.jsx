import React, { createContext, useContext, useState, useCallback } from 'react';

const EntityDetailsContext = createContext(null);

export const EntityDetailsProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [entityType, setEntityType] = useState(null);
  const [entityId, setEntityId] = useState(null);
  const [entityData, setEntityData] = useState(null);

  const open = useCallback((type, id, data = null) => {
    setEntityType(type);
    setEntityId(id);
    setEntityData(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setEntityType(null);
      setEntityId(null);
      setEntityData(null);
    }, 300);
  }, []);

  const openPart = useCallback((id, data) => open('part', id, data), [open]);
  const openPartColor = useCallback(
    (id, data) => open('part_color', id, data),
    [open],
  );
  const openEquipment = useCallback(
    (id, data) => open('equipment', id, data),
    [open],
  );
  const openOrder = useCallback((id, data) => open('order', id, data), [open]);
  const openColor = useCallback((id, data) => open('color', id, data), [open]);
  const openCategory = useCallback(
    (id, data) => open('category', id, data),
    [open],
  );
  const openBrand = useCallback((id, data) => open('brand', id, data), [open]);

  const value = {
    isOpen,
    entityType,
    entityId,
    entityData,
    open,
    close,
    openPart,
    openPartColor,
    openEquipment,
    openOrder,
    openColor,
    openCategory,
    openBrand,
  };

  return (
    <EntityDetailsContext.Provider value={value}>
      {children}
    </EntityDetailsContext.Provider>
  );
};

export const useEntityDetails = () => {
  const context = useContext(EntityDetailsContext);
  if (!context) {
    throw new Error(
      'useEntityDetails must be used within EntityDetailsProvider',
    );
  }
  return context;
};

export default EntityDetailsContext;
