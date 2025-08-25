import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/users/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user profile
      const userResponse = await api.get('/users/me');
      return userResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, email, password }, { dispatch, rejectWithValue }) => {
    try {
      await api.post('/users/register', {
        username,
        email,
        password,
      });

      // Auto-login after successful registration
      return await dispatch(loginUser({ username, password })).unwrap();
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Registration failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  }
);

export const updateWallet = createAsyncThunk(
  'auth/updateWallet',
  async ({ amount, transaction_type, description }, { rejectWithValue }) => {
    try {
      await api.post('/users/wallet/update', {
        amount: parseFloat(amount),
        transaction_type,
        description: description || `Wallet ${transaction_type} via dashboard`
      });

      // Fetch updated user data
      const userResponse = await api.get('/users/me');
      return userResponse.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Wallet update failed');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    updateUserBalance: (state, action) => {
      if (state.user) {
        state.user.wallet_balance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      })
      // Update wallet
      .addCase(updateWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, updateUser, updateUserBalance } = authSlice.actions;
export default authSlice.reducer;
