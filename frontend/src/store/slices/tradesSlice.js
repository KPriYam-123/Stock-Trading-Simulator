import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for trade operations
export const placeOrder = createAsyncThunk(
  'trades/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/trades/place-order', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Order placement failed');
    }
  }
);

export const fetchTradeHistory = createAsyncThunk(
  'trades/fetchTradeHistory',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trades/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch trade history');
    }
  }
);

export const fetchPositions = createAsyncThunk(
  'trades/fetchPositions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/trades/positions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch positions');
    }
  }
);

const initialState = {
  orders: [],
  tradeHistory: [],
  positions: [],
  loading: false,
  error: null,
  lastOrderResult: null,
};

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastOrderResult: (state) => {
      state.lastOrderResult = null;
    },
    addLocalOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.lastOrderResult = {
          success: true,
          order: action.payload,
          message: `Successfully placed ${action.payload.order_type.toUpperCase()} order for ${action.payload.quantity} shares of ${action.payload.symbol}`
        };
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.lastOrderResult = {
          success: false,
          message: action.payload
        };
      })
      // Fetch trade history
      .addCase(fetchTradeHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTradeHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.tradeHistory = action.payload;
      })
      .addCase(fetchTradeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch positions
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearLastOrderResult, addLocalOrder } = tradesSlice.actions;
export default tradesSlice.reducer;
