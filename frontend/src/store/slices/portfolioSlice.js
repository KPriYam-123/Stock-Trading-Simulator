import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { portfolioService } from '../../services/portfolioService';

// Mock portfolio data
const mockPortfolio = [
  { symbol: 'AAPL', shares: 10, avgPrice: 170.25, currentPrice: 175.50 },
  { symbol: 'GOOGL', shares: 2, avgPrice: 2800.00, currentPrice: 2845.20 },
  { symbol: 'MSFT', shares: 5, avgPrice: 365.50, currentPrice: 378.90 },
];

// Async thunks for portfolio operations
export const fetchPortfolioHoldings = createAsyncThunk(
  'portfolio/fetchHoldings',
  async (_, { rejectWithValue }) => {
    try {
      const holdings = await portfolioService.getHoldings();
      return holdings;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPortfolioPerformance = createAsyncThunk(
  'portfolio/fetchPerformance',
  async (_, { rejectWithValue }) => {
    try {
      const performance = await portfolioService.getPerformanceMetrics();
      return performance;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPortfolioProfitLoss = createAsyncThunk(
  'portfolio/fetchProfitLoss',
  async (period = '1M', { rejectWithValue }) => {
    try {
      const profitLoss = await portfolioService.getProfitLoss(period);
      return profitLoss;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPortfolioAllocation = createAsyncThunk(
  'portfolio/fetchAllocation',
  async (_, { rejectWithValue }) => {
    try {
      const allocation = await portfolioService.getAllocation();
      return allocation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPortfolioValueHistory = createAsyncThunk(
  'portfolio/fetchValueHistory',
  async (period = '1M', { rejectWithValue }) => {
    try {
      const valueHistory = await portfolioService.getValueHistory(period);
      return valueHistory;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  holdings: mockPortfolio,
  totalValue: 0,
  totalGainLoss: 0,
  totalGainLossPercent: 0,
  performance: {},
  profitLoss: [],
  allocation: [],
  valueHistory: [],
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    updatePortfolioPrices: (state, action) => {
      const stockPrices = action.payload; // Array of stocks with current prices
      
      // Only update if we have valid stock prices array
      if (Array.isArray(stockPrices) && stockPrices.length > 0) {
        state.holdings = state.holdings.map(holding => {
          const stock = stockPrices.find(s => s.symbol === holding.symbol);
          if (stock) {
            return {
              ...holding,
              currentPrice: stock.price
            };
          }
          return holding;
        });
      }
      
      // Calculate totals
      const totalCurrent = state.holdings.reduce((total, holding) => 
        total + (holding.shares * holding.currentPrice), 0
      );
      const totalInvested = state.holdings.reduce((total, holding) => 
        total + (holding.shares * holding.avgPrice), 0
      );
      
      state.totalValue = parseFloat(totalCurrent.toFixed(2));
      state.totalGainLoss = parseFloat((totalCurrent - totalInvested).toFixed(2));
      state.totalGainLossPercent = totalInvested > 0 ? 
        parseFloat(((state.totalGainLoss / totalInvested) * 100).toFixed(2)) : 0;
    },
    addHolding: (state, action) => {
      const { symbol, shares, price } = action.payload;
      const existingHolding = state.holdings.find(h => h.symbol === symbol);
      
      if (existingHolding) {
        // Update existing holding
        const totalShares = existingHolding.shares + shares;
        const totalValue = (existingHolding.shares * existingHolding.avgPrice) + (shares * price);
        existingHolding.avgPrice = parseFloat((totalValue / totalShares).toFixed(2));
        existingHolding.shares = totalShares;
      } else {
        // Add new holding
        state.holdings.push({
          symbol,
          shares,
          avgPrice: price,
          currentPrice: price
        });
      }
    },
    reduceHolding: (state, action) => {
      const { symbol, shares } = action.payload;
      const holdingIndex = state.holdings.findIndex(h => h.symbol === symbol);
      
      if (holdingIndex !== -1) {
        const holding = state.holdings[holdingIndex];
        if (holding.shares <= shares) {
          // Remove holding if selling all or more shares
          state.holdings.splice(holdingIndex, 1);
        } else {
          // Reduce shares
          holding.shares -= shares;
        }
      }
    },
    clearPortfolio: (state) => {
      state.holdings = [];
      state.totalValue = 0;
      state.totalGainLoss = 0;
      state.totalGainLossPercent = 0;
      state.performance = {};
      state.profitLoss = [];
      state.allocation = [];
      state.valueHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Holdings
      .addCase(fetchPortfolioHoldings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioHoldings.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings = action.payload;
      })
      .addCase(fetchPortfolioHoldings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Performance
      .addCase(fetchPortfolioPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performance = action.payload;
      })
      .addCase(fetchPortfolioPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Profit/Loss
      .addCase(fetchPortfolioProfitLoss.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioProfitLoss.fulfilled, (state, action) => {
        state.loading = false;
        state.profitLoss = action.payload;
      })
      .addCase(fetchPortfolioProfitLoss.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Allocation
      .addCase(fetchPortfolioAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioAllocation.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload;
      })
      .addCase(fetchPortfolioAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Value History
      .addCase(fetchPortfolioValueHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioValueHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.valueHistory = action.payload;
      })
      .addCase(fetchPortfolioValueHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  updatePortfolioPrices, 
  addHolding, 
  reduceHolding, 
  clearPortfolio 
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
