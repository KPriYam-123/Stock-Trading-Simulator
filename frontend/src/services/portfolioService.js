import api from './api';

export const portfolioService = {
  // Fetch user's portfolio holdings
  async getHoldings() {
    try {
      const response = await api.get('/portfolio/holdings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch portfolio holdings');
    }
  },

  // Fetch portfolio performance metrics
  async getPerformanceMetrics() {
    try {
      const response = await api.get('/portfolio/performance');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch performance metrics');
    }
  },

  // Fetch portfolio P&L data
  async getProfitLoss(period = '1M') {
    try {
      const response = await api.get(`/portfolio/pnl?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch P&L data');
    }
  },

  // Fetch portfolio allocation data
  async getAllocation() {
    try {
      const response = await api.get('/portfolio/allocation');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch portfolio allocation');
    }
  },

  // Fetch portfolio value history
  async getValueHistory(period = '1M') {
    try {
      const response = await api.get(`/portfolio/value-history?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch portfolio value history');
    }
  }
};
