import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { stockAPI } from '../../api/api';

export const fetchStockMovements = createAsyncThunk(
  'stock/fetchMovements',
  async () => {
    const response = await stockAPI.getMovements();
    return response.data.data;
  }
);

export const fetchStockLevels = createAsyncThunk(
  'stock/fetchLevels',
  async () => {
    const response = await stockAPI.getLevels();
    return response.data.data;
  }
);

export const fetchStockAlerts = createAsyncThunk(
  'stock/fetchAlerts',
  async () => {
    const response = await stockAPI.getAlerts();
    return response.data.data;
  }
);

export const addStock = createAsyncThunk('stock/add', async (data) => {
  const response = await stockAPI.addStock(data);
  return response.data;
});

export const adjustStock = createAsyncThunk('stock/adjust', async (data) => {
  const response = await stockAPI.adjustStock(data);
  return response.data;
});

const stockSlice = createSlice({
  name: 'stock',
  initialState: {
    movements: [],
    levels: [],
    alerts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockMovements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchStockMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStockLevels.fulfilled, (state, action) => {
        state.levels = action.payload;
      })
      .addCase(fetchStockAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      });
  },
});

export default stockSlice.reducer;
