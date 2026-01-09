import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryAPI } from '../../api/api';

export const fetchTransactions = createAsyncThunk(
  'inventory/fetchTransactions',
  async () => {
    const { data } = await inventoryAPI.getTransactions();
    return data.data;
  }
);

export const fetchTransactionsByPartColor = createAsyncThunk(
  'inventory/fetchByPartColor',
  async (partColorId) => {
    const { data } = await inventoryAPI.getByPartColor(partColorId);
    return data.data;
  }
);

export const createTransaction = createAsyncThunk(
  'inventory/createTransaction',
  async (transactionData) => {
    const { data } = await inventoryAPI.createTransaction(transactionData);
    return data.data;
  }
);

export const fetchStats = createAsyncThunk('inventory/fetchStats', async () => {
  const { data } = await inventoryAPI.getStats();
  return data.data;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    transactions: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTransactionsByPartColor.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default inventorySlice.reducer;
