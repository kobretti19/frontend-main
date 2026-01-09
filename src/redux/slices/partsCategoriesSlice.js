import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { partsCategoriesAPI } from '../../api/api';

export const fetchPartsCategories = createAsyncThunk(
  'partsCategories/fetchAll',
  async () => {
    const response = await partsCategoriesAPI.getAll();
    return response.data.data;
  }
);

export const createPartsCategory = createAsyncThunk(
  'partsCategories/create',
  async (data) => {
    const response = await partsCategoriesAPI.create(data);
    return response.data.data;
  }
);

export const updatePartsCategory = createAsyncThunk(
  'partsCategories/update',
  async ({ id, data }) => {
    const response = await partsCategoriesAPI.update(id, data);
    return response.data.data;
  }
);

export const deletePartsCategory = createAsyncThunk(
  'partsCategories/delete',
  async (id) => {
    await partsCategoriesAPI.delete(id);
    return id;
  }
);

const partsCategoriesSlice = createSlice({
  name: 'partsCategories',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartsCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPartsCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPartsCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPartsCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePartsCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePartsCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default partsCategoriesSlice.reducer;
