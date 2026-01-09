import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { colorsAPI } from '../../api/api';

export const fetchColors = createAsyncThunk('colors/fetchAll', async () => {
  const response = await colorsAPI.getAll();
  return response.data.data;
});

export const createColor = createAsyncThunk('colors/create', async (data) => {
  const response = await colorsAPI.create(data);
  return response.data.data;
});

export const updateColor = createAsyncThunk(
  'colors/update',
  async ({ id, data }) => {
    const response = await colorsAPI.update(id, data);
    return response.data.data;
  }
);

export const deleteColor = createAsyncThunk('colors/delete', async (id) => {
  await colorsAPI.delete(id);
  return id;
});

const colorsSlice = createSlice({
  name: 'colors',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchColors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createColor.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateColor.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteColor.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default colorsSlice.reducer;
