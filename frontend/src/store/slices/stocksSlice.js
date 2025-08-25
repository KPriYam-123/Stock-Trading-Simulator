import { createSlice } from '@reduxjs/toolkit';

// Mock stock data
const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.45, changePercent: 1.42 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2845.20, change: -15.30, changePercent: -0.53 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 8.75, changePercent: 2.36 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -5.23, changePercent: -2.08 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3456.78, change: 23.45, changePercent: 0.68 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 456.32, change: 12.87, changePercent: 2.90 },
  { symbol: 'META', name: 'Meta Platforms', price: 324.15, change: -7.89, changePercent: -2.37 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 456.78, change: 15.23, changePercent: 3.45 },
];

const initialState = {
  stocks: mockStocks,
  selectedStock: null,
  loading: false,
  error: null,
};

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    updateStockPrices: (state) => {
      state.stocks = state.stocks.map(stock => {
        const randomChange = (Math.random() - 0.5) * 5; // Random change between -2.5 and +2.5
        const newPrice = Math.max(0.01, stock.price + randomChange);
        const change = newPrice - stock.price;
        const changePercent = (change / stock.price) * 100;
        
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2))
        };
      });
      
      // Update selected stock if it exists
      if (state.selectedStock) {
        const updatedStock = state.stocks.find(stock => stock.symbol === state.selectedStock.symbol);
        if (updatedStock) {
          state.selectedStock = updatedStock;
        }
      }
    },
    selectStock: (state, action) => {
      state.selectedStock = action.payload;
    },
    clearSelectedStock: (state) => {
      state.selectedStock = null;
    },
  },
});

export const { updateStockPrices, selectStock, clearSelectedStock } = stocksSlice.actions;
export default stocksSlice.reducer;
