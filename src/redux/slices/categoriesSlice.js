import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoriesAPI } from '../../api/api';

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async () => {
    const response = await categoriesAPI.getAll();
    return response.data.data;
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data) => {
    const response = await categoriesAPI.create(data);
    return response.data.data;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }) => {
    const response = await categoriesAPI.update(id, data);
    return response.data.data;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id) => {
    await categoriesAPI.delete(id);
    return id;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
