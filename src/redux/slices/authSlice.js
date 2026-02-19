import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../api/api";

// Check for existing token on load
const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  },
);

// Register
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed",
      );
    }
  },
);

// Get Profile
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.data;

      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue(
        error.response?.data?.error || "Failed to get profile",
      );
    }
  },
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logoutSync: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, logoutSync } = authSlice.actions;
export default authSlice.reducer;
