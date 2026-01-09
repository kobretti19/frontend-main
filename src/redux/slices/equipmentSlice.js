import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { equipmentAPI } from '../../api/api';

export const fetchEquipment = createAsyncThunk(
  'equipment/fetchAll',
  async () => {
    const response = await equipmentAPI.getAll();
    return response.data.data;
  }
);

export const fetchInventory = createAsyncThunk(
  'equipment/fetchInventory',
  async () => {
    const response = await equipmentAPI.getInventory();
    return response.data.data;
  }
);

export const fetchLowStock = createAsyncThunk(
  'equipment/fetchLowStock',
  async () => {
    const response = await equipmentAPI.getLowStock();
    return response.data.data;
  }
);

export const createEquipment = createAsyncThunk(
  'equipment/create',
  async (data) => {
    const response = await equipmentAPI.create(data);
    return response.data.data;
  }
);

export const updateEquipment = createAsyncThunk(
  'equipment/update',
  async ({ id, data }) => {
    const response = await equipmentAPI.update(id, data);
    return response.data.data;
  }
);

export const deleteEquipment = createAsyncThunk(
  'equipment/delete',
  async (id) => {
    await equipmentAPI.delete(id);
    return id;
  }
);

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState: {
    items: [],
    inventory: [],
    lowStock: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStock = action.payload;
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default equipmentSlice.reducer;
