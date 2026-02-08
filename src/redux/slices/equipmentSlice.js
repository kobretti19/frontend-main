import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { equipmentAPI } from '../../api/api';

// Fetch all equipment
export const fetchEquipment = createAsyncThunk(
  'equipment/fetchAll',
  async () => {
    const response = await equipmentAPI.getAll();
    return response.data.data;
  },
);

// Fetch single equipment
export const fetchEquipmentById = createAsyncThunk(
  'equipment/fetchById',
  async (id) => {
    const response = await equipmentAPI.getById(id);
    return response.data.data;
  },
);

// Fetch dropdown options
export const fetchBrands = createAsyncThunk(
  'equipment/fetchBrands',
  async () => {
    const response = await equipmentAPI.getBrands();
    return response.data.data;
  },
);

export const fetchCategories = createAsyncThunk(
  'equipment/fetchCategories',
  async () => {
    const response = await equipmentAPI.getCategories();
    return response.data.data;
  },
);

// Create equipment (with optional template_id)
export const createEquipment = createAsyncThunk(
  'equipment/create',
  async (data) => {
    const response = await equipmentAPI.create(data);
    return response.data.data;
  },
);

// Update equipment
export const updateEquipment = createAsyncThunk(
  'equipment/update',
  async ({ id, data }) => {
    const response = await equipmentAPI.update(id, data);
    return response.data.data;
  },
);

// Delete equipment
export const deleteEquipment = createAsyncThunk(
  'equipment/delete',
  async (id) => {
    await equipmentAPI.delete(id);
    return id;
  },
);

// Add part to equipment
export const addPartToEquipment = createAsyncThunk(
  'equipment/addPart',
  async ({ equipmentId, data }) => {
    const response = await equipmentAPI.addPart(equipmentId, data);
    return { equipmentId, ...response.data };
  },
);

// Remove part from equipment
export const removePartFromEquipment = createAsyncThunk(
  'equipment/removePart',
  async ({ equipmentId, partId }) => {
    await equipmentAPI.removePart(equipmentId, partId);
    return { equipmentId, partId };
  },
);

// Produce equipment (reduce stock)
export const produceEquipment = createAsyncThunk(
  'equipment/produce',
  async (equipmentId) => {
    const response = await equipmentAPI.produce(equipmentId);
    return response.data;
  },
);

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState: {
    items: [],
    currentEquipment: null,
    brands: [],
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentEquipment: (state) => {
      state.currentEquipment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch by ID
      .addCase(fetchEquipmentById.fulfilled, (state, action) => {
        state.currentEquipment = action.payload;
      })
      // Fetch brands
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Create
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateEquipment.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearCurrentEquipment, clearError } = equipmentSlice.actions;
export default equipmentSlice.reducer;
