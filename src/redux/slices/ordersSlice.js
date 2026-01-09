import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersAPI } from '../../api/api';

/* =======================
   THUNKS
======================= */

export const fetchOrders = createAsyncThunk('orders/fetchAll', async () => {
  const { data } = await ordersAPI.getAll();
  return data.data;
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async () => {
  const { data } = await ordersAPI.getMyOrders();
  return data.data;
});

export const fetchOrderStats = createAsyncThunk(
  'orders/fetchStats',
  async () => {
    const { data } = await ordersAPI.getStats();
    return data.data;
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData) => {
    const { data } = await ordersAPI.create(orderData);
    return data.data;
  }
);

/**
 * ✅ UPDATED: supports quantity editing on delivery
 */
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status, notes, items }, { rejectWithValue }) => {
    try {
      await ordersAPI.updateStatus(id, {
        status,
        notes,
        items: status === 'delivered' ? items : undefined,
      });

      return { id, status, items };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
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
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* FETCH ORDERS */
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      /* FETCH MY ORDERS */
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      /* STATS */
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      /* CREATE */
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* ✅ UPDATE STATUS + ITEMS */
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { id, status, items } = action.payload;

        const order = state.items.find((o) => o.id === id);
        if (!order) return;

        order.status = status;

        // If delivered & items were updated, refresh summary values
        if (status === 'delivered' && Array.isArray(items)) {
          order.total_quantity = items.reduce(
            (sum, i) => sum + Number(i.quantity || 0),
            0
          );

          if (order.total_amount != null) {
            order.total_amount = items.reduce(
              (sum, i) =>
                sum +
                Number(i.quantity || 0) *
                  Number(i.purchase_price_at_order || 0),
              0
            );
          }
        }
      })

      /* DELETE */
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default ordersSlice.reducer;