import { configureStore } from '@reduxjs/toolkit';
import partsReducer from './slices/partsSlice';
import equipmentReducer from './slices/equipmentSlice';
import ordersReducer from './slices/ordersSlice';
import stockReducer from './slices/stockSlice';
import equipmentTemplatesReducer from './slices/equipmentTemplatesSlice';

export const store = configureStore({
  reducer: {
    parts: partsReducer,
    equipment: equipmentReducer,
    orders: ordersReducer,
    stock: stockReducer,
    equipmentTemplates: equipmentTemplatesReducer,
  },
});
