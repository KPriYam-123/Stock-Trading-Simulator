import api from './api';

export const analyticsService = {
  // Fetch stock price history for charts
  async getStockHistory(symbol, period = '1M') {
    try {
      const response = await api.get(`/analytics/stock-history/${symbol}?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch stock history');
    }
  },

  // Fetch moving averages data
  async getMovingAverages(symbol, periods = [20, 50, 200]) {
    try {
      const response = await api.get(`/analytics/moving-averages/${symbol}?periods=${periods.join(',')}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch moving averages');
    }
  },

  // Fetch volume trends
  async getVolumeTrends(symbol, period = '1M') {
    try {
      const response = await api.get(`/analytics/volume-trends/${symbol}?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch volume trends');
    }
  },

  // Fetch technical indicators
  async getTechnicalIndicators(symbol) {
    try {
      const response = await api.get(`/analytics/technical-indicators/${symbol}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch technical indicators');
    }
  },

  // Fetch market overview data
  async getMarketOverview() {
    try {
      const response = await api.get('/analytics/market-overview');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch market overview');
    }
  },

  // Fetch sector performance
  async getSectorPerformance() {
    try {
      const response = await api.get('/analytics/sector-performance');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch sector performance');
    }
  },

  // Calculate RSI (Relative Strength Index)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return [];
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const rsi = [];
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    return rsi;
  },

  // Calculate MACD (Moving Average Convergence Divergence)
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const ema = (data, period) => {
      const k = 2 / (period + 1);
      const emaArray = [data[0]];
      for (let i = 1; i < data.length; i++) {
        emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
      }
      return emaArray;
    };

    const fastEMA = ema(prices, fastPeriod);
    const slowEMA = ema(prices, slowPeriod);
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signalLine = ema(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    return { macdLine, signalLine, histogram };
  },

  // Calculate Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma = [];
    const upperBand = [];
    const lowerBand = [];

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);

      sma.push(mean);
      upperBand.push(mean + (standardDeviation * stdDev));
      lowerBand.push(mean - (standardDeviation * stdDev));
    }

    return { sma, upperBand, lowerBand };
  }
};
