import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { partsColorsAPI } from '../../api/api';

// Fetch all
export const fetchPartsColors = createAsyncThunk(
  'partsColors/fetchAll',
  async () => {
    const { data } = await partsColorsAPI.getAll();
    return data.data;
  }
);

// Fetch low stock
export const fetchLowStock = createAsyncThunk(
  'partsColors/fetchLowStock',
  async () => {
    const { data } = await partsColorsAPI.getLowStock();
    return data.data;
  }
);

// Create - THIS IS THE IMPORTANT ONE
export const createPartsColor = createAsyncThunk(
  'partsColors/create',
  async (partColorData) => {
    console.log('Slice sending:', partColorData); // DEBUG
    const { data } = await partsColorsAPI.create(partColorData);
    return data.data;
  }
);

// Update
export const updatePartsColor = createAsyncThunk(
  'partsColors/update',
  async ({ id, data: updateData }) => {
    const { data } = await partsColorsAPI.update(id, updateData);
    return data.data;
  }
);

// Update quantity
export const updateQuantity = createAsyncThunk(
  'partsColors/updateQuantity',
  async ({ id, data: quantityData }) => {
    const { data } = await partsColorsAPI.updateQuantity(id, quantityData);
    return data.data;
  }
);

// Delete
export const deletePartsColor = createAsyncThunk(
  'partsColors/delete',
  async (id) => {
    await partsColorsAPI.delete(id);
    return id;
  }
);

const partsColorsSlice = createSlice({
  name: 'partsColors',
  initialState: {
    items: [],
    lowStock: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartsColors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPartsColors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPartsColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStock = action.payload;
      })
      .addCase(createPartsColor.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePartsColor.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(deletePartsColor.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export default partsColorsSlice.reducer;
