import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { equipmentTemplatesAPI } from '../../api/api';

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'equipmentTemplates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await equipmentTemplatesAPI.getAll();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchTemplateById = createAsyncThunk(
  'equipmentTemplates/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await equipmentTemplatesAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createTemplate = createAsyncThunk(
  'equipmentTemplates/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await equipmentTemplatesAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createTemplateFromEquipment = createAsyncThunk(
  'equipmentTemplates/createFromEquipment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await equipmentTemplatesAPI.createFromEquipment(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'equipmentTemplates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await equipmentTemplatesAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'equipmentTemplates/delete',
  async (id, { rejectWithValue }) => {
    try {
      await equipmentTemplatesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const equipmentTemplatesSlice = createSlice({
  name: 'equipmentTemplates',
  initialState: {
    items: [],
    currentTemplate: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all templates
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single template
      .addCase(fetchTemplateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTemplate = action.payload;
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create template
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create from equipment
      .addCase(createTemplateFromEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplateFromEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTemplateFromEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update template
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete template
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentTemplate, clearError } = equipmentTemplatesSlice.actions;
export default equipmentTemplatesSlice.reducer;
