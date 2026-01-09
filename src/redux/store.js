import { configureStore } from '@reduxjs/toolkit';
import brandsReducer from './slices/brandsSlice';
import categoriesReducer from './slices/categoriesSlice';
import colorsReducer from './slices/colorsSlice';
import partsReducer from './slices/partsSlice';
import partsCategoriesReducer from './slices/partsCategoriesSlice';
import partsColorsReducer from './slices/partsColorsSlice';
import equipmentReducer from './slices/equipmentSlice';
import ordersReducer from './slices/ordersSlice';
import stockReducer from './slices/stockSlice';
import inventoryReducer from './slices/inventorySlice'; 
import equipmentTemplatesReducer from './slices/equipmentTemplatesSlice';



export const store = configureStore({
  reducer: {
    brands: brandsReducer,
    categories: categoriesReducer,
    colors: colorsReducer,
    parts: partsReducer,
    partsCategories: partsCategoriesReducer,
    partsColors: partsColorsReducer,
    equipment: equipmentReducer,
    orders: ordersReducer,
    stock: stockReducer,
    inventory: inventoryReducer,
    equipmentTemplates: equipmentTemplatesReducer,
  },
});
