import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { stockAPI } from '../../api/api';

export const fetchStockMovements = createAsyncThunk(
  'stock/fetchMovements',
  async () => {
    const response = await stockAPI.getMovements();
    return response.data.data;
  },
);

export const fetchMovementsByPart = createAsyncThunk(
  'stock/fetchMovementsByPart',
  async (partId) => {
    const response = await stockAPI.getMovementsByPart(partId);
    return response.data.data;
  },
);

export const fetchStockLevels = createAsyncThunk(
  'stock/fetchLevels',
  async () => {
    const response = await stockAPI.getLevels();
    return response.data.data;
  },
);

export const fetchStockAlerts = createAsyncThunk(
  'stock/fetchAlerts',
  async () => {
    const response = await stockAPI.getAlerts();
    return response.data.data;
  },
);

export const fetchStockSummary = createAsyncThunk(
  'stock/fetchSummary',
  async () => {
    const response = await stockAPI.getSummary();
    return response.data.data;
  },
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
    partMovements: [],
    levels: [],
    alerts: [],
    summary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPartMovements: (state) => {
      state.partMovements = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch movements
      .addCase(fetchStockMovements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchStockMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch movements by part
      .addCase(fetchMovementsByPart.fulfilled, (state, action) => {
        state.partMovements = action.payload;
      })
      // Fetch levels
      .addCase(fetchStockLevels.fulfilled, (state, action) => {
        state.levels = action.payload;
      })
      // Fetch alerts
      .addCase(fetchStockAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      })
      // Fetch summary
      .addCase(fetchStockSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      // Add stock
      .addCase(addStock.fulfilled, (state) => {
        // Refresh will be triggered by component
      })
      // Adjust stock
      .addCase(adjustStock.fulfilled, (state) => {
        // Refresh will be triggered by component
      });
  },
});

export const { clearPartMovements, clearError } = stockSlice.actions;
export default stockSlice.reducer;
