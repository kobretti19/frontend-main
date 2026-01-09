import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { partsAPI } from '../../api/api';

export const fetchParts = createAsyncThunk('parts/fetchAll', async () => {
  const response = await partsAPI.getDetailed();
  return response.data.data;
});

export const fetchPartsInventory = createAsyncThunk(
  'parts/fetchInventory',
  async () => {
    const response = await partsAPI.getInventory();
    return response.data.data;
  }
);

export const createPart = createAsyncThunk('parts/create', async (data) => {
  const response = await partsAPI.create(data);
  return response.data.data;
});

export const updatePart = createAsyncThunk(
  'parts/update',
  async ({ id, data }) => {
    const response = await partsAPI.update(id, data);
    return response.data.data;
  }
);

export const deletePart = createAsyncThunk('parts/delete', async (id) => {
  await partsAPI.delete(id);
  return id;
});

const partsSlice = createSlice({
  name: 'parts',
  initialState: {
    items: [],
    inventory: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchParts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPartsInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      .addCase(createPart.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePart.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default partsSlice.reducer;
