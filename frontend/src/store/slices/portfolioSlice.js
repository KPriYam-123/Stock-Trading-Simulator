import { createSlice } from '@reduxjs/toolkit';

// Mock portfolio data
const mockPortfolio = [
  { symbol: 'AAPL', shares: 10, avgPrice: 170.25, currentPrice: 175.50 },
  { symbol: 'GOOGL', shares: 2, avgPrice: 2800.00, currentPrice: 2845.20 },
  { symbol: 'MSFT', shares: 5, avgPrice: 365.50, currentPrice: 378.90 },
];

const initialState = {
  holdings: mockPortfolio,
  totalValue: 0,
  totalGainLoss: 0,
  totalGainLossPercent: 0,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    updatePortfolioPrices: (state, action) => {
      const stockPrices = action.payload; // Array of stocks with current prices
      
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
    },
  },
});

export const { 
  updatePortfolioPrices, 
  addHolding, 
  reduceHolding, 
  clearPortfolio 
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
