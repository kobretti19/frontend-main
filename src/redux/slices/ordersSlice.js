import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersAPI } from '../../api/api';

/* =======================
   THUNKS
======================= */

export const fetchOrders = createAsyncThunk('orders/fetchAll', async () => {
  const { data } = await ordersAPI.getAll();
  return data.data;
});

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id) => {
    const { data } = await ordersAPI.getById(id);
    return data.data;
  },
);

export const fetchOrderStats = createAsyncThunk(
  'orders/fetchStats',
  async () => {
    const { data } = await ordersAPI.getStats();
    return data.data;
  },
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData) => {
    const { data } = await ordersAPI.create(orderData);
    return data.data;
  },
);

export const updateOrder = createAsyncThunk(
  'orders/update',
  async ({ id, data: orderData }) => {
    const { data } = await ordersAPI.update(id, orderData);
    return data.data;
  },
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status, notes, items }, { rejectWithValue }) => {
    try {
      const isDeliveryStatus = status === 'delivered' || status === 'partial';

      await ordersAPI.updateStatus(id, {
        status,
        notes,
        items: isDeliveryStatus && items ? items : undefined,
      });

      return { id, status, items };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const deleteOrder = createAsyncThunk('orders/delete', async (id) => {
  await ordersAPI.delete(id);
  return id;
});

/* =======================
   SLICE
======================= */

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ORDERS */
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      /* FETCH ORDER BY ID */
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      /* STATS */
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      /* CREATE */
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      /* UPDATE STATUS */
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { id, status, items } = action.payload;
        const order = state.items.find((o) => o.id === id);
        if (!order) return;

        order.status = status;

        const isDeliveryStatus = status === 'delivered' || status === 'partial';
        if (isDeliveryStatus && Array.isArray(items)) {
          order.total_delivered = items.reduce(
            (sum, i) => sum + Number(i.quantity_delivered || 0),
            0,
          );
          order.total_backorder = items.reduce(
            (sum, i) => sum + Number(i.quantity_backorder || 0),
            0,
          );
        }
      })

      /* DELETE */
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearCurrentOrder, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
