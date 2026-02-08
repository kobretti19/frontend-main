import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { partsAPI } from '../../api/api';

// Fetch all parts
export const fetchParts = createAsyncThunk('parts/fetchAll', async () => {
  const response = await partsAPI.getAll();
  return response.data.data;
});

// Fetch single part
export const fetchPartById = createAsyncThunk('parts/fetchById', async (id) => {
  const response = await partsAPI.getById(id);
  return response.data.data;
});

// Fetch low stock parts
export const fetchLowStock = createAsyncThunk(
  'parts/fetchLowStock',
  async () => {
    const response = await partsAPI.getLowStock();
    return response.data.data;
  },
);

// Fetch dropdown options
export const fetchColors = createAsyncThunk('parts/fetchColors', async () => {
  const response = await partsAPI.getColors();
  return response.data.data;
});

export const fetchCategories = createAsyncThunk(
  'parts/fetchCategories',
  async () => {
    const response = await partsAPI.getCategories();
    return response.data.data;
  },
);

export const fetchSuppliers = createAsyncThunk(
  'parts/fetchSuppliers',
  async () => {
    const response = await partsAPI.getSuppliers();
    return response.data.data;
  },
);

// Create part
export const createPart = createAsyncThunk('parts/create', async (data) => {
  const response = await partsAPI.create(data);
  return response.data.data;
});

// Update part
export const updatePart = createAsyncThunk(
  'parts/update',
  async ({ id, data }) => {
    const response = await partsAPI.update(id, data);
    return response.data.data;
  },
);

// Update quantity
export const updatePartQuantity = createAsyncThunk(
  'parts/updateQuantity',
  async ({ id, data }) => {
    const response = await partsAPI.updateQuantity(id, data);
    return response.data.data;
  },
);

// Delete part
export const deletePart = createAsyncThunk('parts/delete', async (id) => {
  await partsAPI.delete(id);
  return id;
});

const partsSlice = createSlice({
  name: 'parts',
  initialState: {
    items: [],
    currentPart: null,
    lowStock: [],
    colors: [],
    categories: [],
    suppliers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentPart: (state) => {
      state.currentPart = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch by ID
      .addCase(fetchPartById.fulfilled, (state, action) => {
        state.currentPart = action.payload;
      })
      // Fetch low stock
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStock = action.payload;
      })
      // Fetch colors
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.colors = action.payload;
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch suppliers
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      })
      // Create
      .addCase(createPart.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updatePart.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Update quantity
      .addCase(updatePartQuantity.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deletePart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearCurrentPart, clearError } = partsSlice.actions;
export default partsSlice.reducer;
