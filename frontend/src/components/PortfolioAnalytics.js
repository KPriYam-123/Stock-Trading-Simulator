import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ComposedChart, Line
} from 'recharts';
import { portfolioService } from '../services/portfolioService';
import { analyticsService } from '../services/analyticsService';
import './PortfolioAnalytics.css';

const PortfolioAnalytics = () => {
  const { user } = useSelector(state => state.auth);
  const { stocks = [] } = useSelector(state => state.stocks); // Default to empty array
  
  // State for portfolio data
  const [portfolioData, setPortfolioData] = useState({
    holdings: [],
    performance: {},
    profitLoss: [],
    allocation: [],
    valueHistory: []
  });
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    selectedStock: 'AAPL',
    stockHistory: [],
    movingAverages: {},
    volumeTrends: [],
    technicalIndicators: {},
    marketOverview: {},
    sectorPerformance: []
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [timePeriod, setTimePeriod] = useState('1M');
  
  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      const [holdings, performance, profitLoss, allocation, valueHistory] = await Promise.all([
        portfolioService.getHoldings(),
        portfolioService.getPerformanceMetrics(),
        portfolioService.getProfitLoss(timePeriod),
        portfolioService.getAllocation(),
        portfolioService.getValueHistory(timePeriod)
      ]);
      
      setPortfolioData({
        holdings,
        performance,
        profitLoss,
        allocation,
        valueHistory
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  }, [timePeriod]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const [stockHistory, movingAverages, volumeTrends, technicalIndicators, marketOverview, sectorPerformance] = await Promise.all([
        analyticsService.getStockHistory(analyticsData.selectedStock, timePeriod),
        analyticsService.getMovingAverages(analyticsData.selectedStock),
        analyticsService.getVolumeTrends(analyticsData.selectedStock, timePeriod),
        analyticsService.getTechnicalIndicators(analyticsData.selectedStock),
        analyticsService.getMarketOverview(),
        analyticsService.getSectorPerformance()
      ]);
      
      setAnalyticsData(prev => ({
        ...prev,
        stockHistory,
        movingAverages,
        volumeTrends,
        technicalIndicators,
        marketOverview,
        sectorPerformance
      }));
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // For demo purposes, generate mock data
      generateMockAnalyticsData();
    }
  }, [analyticsData.selectedStock, timePeriod, generateMockAnalyticsData]);

  const generateMockAnalyticsData = useCallback(() => {
    // Generate mock stock price data
    const stockHistory = [];
    const volumeTrends = [];
    let basePrice = 150;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      const priceChange = (Math.random() - 0.5) * 10;
      basePrice += priceChange;
      const volume = Math.floor(Math.random() * 1000000) + 500000;
      
      stockHistory.push({
        date: date.toISOString().split('T')[0],
        open: basePrice - 2,
        high: basePrice + 3,
        low: basePrice - 3,
        close: basePrice,
        volume: volume
      });
      
      volumeTrends.push({
        date: date.toISOString().split('T')[0],
        volume: volume,
        avgVolume: 750000
      });
    }

    // Generate moving averages
    const prices = stockHistory.map(d => d.close);
    const movingAverages = {
      ma20: calculateMovingAverage(prices, 20),
      ma50: calculateMovingAverage(prices, 50),
      ma200: calculateMovingAverage(prices, 200)
    };

    // Generate technical indicators
    const technicalIndicators = {
      rsi: analyticsService.calculateRSI(prices),
      macd: analyticsService.calculateMACD(prices),
      bollingerBands: analyticsService.calculateBollingerBands(prices)
    };

    // Generate sector performance
    const sectorPerformance = [
      { sector: 'Technology', performance: 12.5, color: '#8884d8' },
      { sector: 'Healthcare', performance: 8.3, color: '#82ca9d' },
      { sector: 'Finance', performance: -2.1, color: '#ffc658' },
      { sector: 'Energy', performance: 15.7, color: '#ff7c7c' },
      { sector: 'Consumer', performance: 6.2, color: '#8dd1e1' }
    ];

    setAnalyticsData(prev => ({
      ...prev,
      stockHistory,
      movingAverages,
      volumeTrends,
      technicalIndicators,
      sectorPerformance
    }));
  }, []);

  const calculateMovingAverage = useCallback((data, period) => {
    if (!Array.isArray(data) || data.length < period) {
      return [];
    }
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }, []);

  const handleStockChange = useCallback((symbol) => {
    setAnalyticsData(prev => ({ ...prev, selectedStock: symbol }));
  }, []);

  useEffect(() => {
    fetchPortfolioData();
    fetchAnalyticsData();
  }, [fetchPortfolioData, fetchAnalyticsData, calculateMovingAverage]);

  // Chart colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <div className="portfolio-analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading portfolio analytics...</p>
      </div>
    );
  }

  return (
    <div className="portfolio-analytics">
      <div className="analytics-header">
        <h2>Portfolio & Analytics Dashboard</h2>
        <div className="analytics-controls">
          <div className="tab-controls">
            <button 
              className={activeTab === 'portfolio' ? 'active' : ''}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
            <button 
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button 
              className={activeTab === 'market' ? 'active' : ''}
              onClick={() => setActiveTab('market')}
            >
              Market Overview
            </button>
          </div>
          
          <div className="time-period-controls">
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option value="1D">1 Day</option>
              <option value="1W">1 Week</option>
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {activeTab === 'portfolio' && (
        <div className="portfolio-tab">
          {/* Portfolio Performance Summary */}
          <div className="performance-summary">
            <div className="metric-card">
              <h3>Total Value</h3>
              <p className="metric-value">${portfolioData.performance.totalValue?.toLocaleString() || '25,450'}</p>
              <span className="metric-change positive">+5.2%</span>
            </div>
            <div className="metric-card">
              <h3>Day's Gain/Loss</h3>
              <p className="metric-value">$1,234</p>
              <span className="metric-change positive">+2.8%</span>
            </div>
            <div className="metric-card">
              <h3>Total Gain/Loss</h3>
              <p className="metric-value">$3,450</p>
              <span className="metric-change positive">+15.7%</span>
            </div>
            <div className="metric-card">
              <h3>Cash Balance</h3>
              <p className="metric-value">${user?.wallet_balance?.toLocaleString() || '5,000'}</p>
            </div>
          </div>

          {/* Portfolio Value Chart */}
          <div className="chart-container">
            <h3>Portfolio Value Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioData.valueHistory.length ? portfolioData.valueHistory : generateMockValueHistory()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio Allocation */}
          <div className="allocation-section">
            <div className="allocation-chart">
              <h3>Portfolio Allocation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portfolioData.allocation.length ? portfolioData.allocation : generateMockAllocation()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {(portfolioData.allocation.length ? portfolioData.allocation : generateMockAllocation()).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="holdings-table">
              <h3>Current Holdings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Shares</th>
                    <th>Avg Cost</th>
                    <th>Current Price</th>
                    <th>Market Value</th>
                    <th>Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {(portfolioData.holdings.length ? portfolioData.holdings : generateMockHoldings()).map((holding, index) => (
                    <tr key={index}>
                      <td className="symbol">{holding.symbol}</td>
                      <td>{holding.shares}</td>
                      <td>${holding.avgCost.toFixed(2)}</td>
                      <td>${holding.currentPrice.toFixed(2)}</td>
                      <td>${holding.marketValue.toLocaleString()}</td>
                      <td className={holding.gainLoss >= 0 ? 'positive' : 'negative'}>
                        ${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-tab">
          {/* Stock Selection */}
          <div className="stock-selector">
            <label>Select Stock for Analysis:</label>
            <select value={analyticsData.selectedStock} onChange={(e) => handleStockChange(e.target.value)}>
              {stocks && stocks.length > 0 ? stocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>{stock.symbol} - {stock.name}</option>
              )) : (
                <option value="AAPL">AAPL - Apple Inc.</option>
              )}
            </select>
          </div>

          {/* Stock Price Chart with Moving Averages */}
          <div className="chart-container">
            <h3>{analyticsData.selectedStock} Price Chart with Moving Averages</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={analyticsData.stockHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#8884d8" name="Close Price" strokeWidth={2} />
                <Line type="monotone" dataKey="ma20" stroke="#82ca9d" name="MA 20" strokeWidth={1} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="ma50" stroke="#ffc658" name="MA 50" strokeWidth={1} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Trends */}
          <div className="chart-container">
            <h3>Volume Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.volumeTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Volume']} />
                <Bar dataKey="volume" fill="#8884d8" />
                <Line type="monotone" dataKey="avgVolume" stroke="#ff7c7c" name="Avg Volume" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Technical Indicators */}
          <div className="indicators-grid">
            <div className="indicator-card">
              <h4>RSI (14)</h4>
              <div className="rsi-indicator">
                <div className="rsi-value">
                  {analyticsData.technicalIndicators.rsi ? 
                    analyticsData.technicalIndicators.rsi[analyticsData.technicalIndicators.rsi.length - 1]?.toFixed(2) : 
                    '65.4'
                  }
                </div>
                <div className="rsi-status">Neutral</div>
              </div>
            </div>

            <div className="indicator-card">
              <h4>MACD</h4>
              <div className="macd-values">
                <div>Signal: Bullish</div>
                <div>Histogram: 1.25</div>
              </div>
            </div>

            <div className="indicator-card">
              <h4>Bollinger Bands</h4>
              <div className="bb-values">
                <div>Upper: $165.50</div>
                <div>Lower: $145.30</div>
                <div>Position: Middle</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="market-tab">
          {/* Sector Performance */}
          <div className="chart-container">
            <h3>Sector Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.sectorPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                <Bar dataKey="performance" fill="#8884d8">
                  {(analyticsData.sectorPerformance || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.performance >= 0 ? '#82ca9d' : '#ff7c7c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Market Overview Cards */}
          <div className="market-overview">
            <div className="market-card">
              <h4>S&P 500</h4>
              <div className="market-value">4,185.47</div>
              <div className="market-change positive">+1.2%</div>
            </div>
            <div className="market-card">
              <h4>NASDAQ</h4>
              <div className="market-value">12,846.81</div>
              <div className="market-change positive">+2.1%</div>
            </div>
            <div className="market-card">
              <h4>DOW</h4>
              <div className="market-value">33,745.40</div>
              <div className="market-change negative">-0.5%</div>
            </div>
            <div className="market-card">
              <h4>VIX</h4>
              <div className="market-value">18.52</div>
              <div className="market-change negative">-3.2%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper functions for mock data
  function generateMockValueHistory() {
    const history = [];
    let baseValue = 22000;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      baseValue += (Math.random() - 0.4) * 500;
      
      history.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(baseValue)
      });
    }
    return history;
  }

  function generateMockAllocation() {
    return [
      { name: 'AAPL', value: 8500 },
      { name: 'GOOGL', value: 6200 },
      { name: 'MSFT', value: 4800 },
      { name: 'TSLA', value: 3200 },
      { name: 'AMZN', value: 2750 }
    ];
  }

  function generateMockHoldings() {
    return [
      { symbol: 'AAPL', shares: 50, avgCost: 150.25, currentPrice: 170.50, marketValue: 8525, gainLoss: 1012.50, gainLossPercent: 13.5 },
      { symbol: 'GOOGL', shares: 25, avgCost: 240.80, currentPrice: 248.40, marketValue: 6210, gainLoss: 190, gainLossPercent: 3.16 },
      { symbol: 'MSFT', shares: 30, avgCost: 155.50, currentPrice: 160.20, marketValue: 4806, gainLoss: 141, gainLossPercent: 3.02 },
      { symbol: 'TSLA', shares: 15, avgCost: 205.30, currentPrice: 213.60, marketValue: 3204, gainLoss: 124.50, gainLossPercent: 4.04 }
    ];
  }
};

export default PortfolioAnalytics;
