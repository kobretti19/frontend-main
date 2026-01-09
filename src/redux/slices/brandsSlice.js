import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { brandsAPI } from '../../api/api';

export const fetchBrands = createAsyncThunk('brands/fetchAll', async () => {
  const response = await brandsAPI.getAll();
  return response.data.data;
});

export const createBrand = createAsyncThunk('brands/create', async (data) => {
  const response = await brandsAPI.create(data);
  return response.data.data;
});

export const updateBrand = createAsyncThunk(
  'brands/update',
  async ({ id, data }) => {
    const response = await brandsAPI.update(id, data);
    return response.data.data;
  }
);

export const deleteBrand = createAsyncThunk('brands/delete', async (id) => {
  await brandsAPI.delete(id);
  return id;
});

const brandsSlice = createSlice({
  name: 'brands',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default brandsSlice.reducer;
