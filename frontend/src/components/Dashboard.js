import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateStockPrices } from '../store/slices/stocksSlice';
import { updatePortfolioPrices } from '../store/slices/portfolioSlice';
import StockList from './StockList';
import TradingForm from './TradingForm';
import Portfolio from './Portfolio';
import WalletManager from './WalletManager';
import PortfolioAnalytics from './PortfolioAnalytics';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stocks } = useAppSelector((state) => state.stocks);
  const [activeView, setActiveView] = useState('trading'); // 'trading' or 'analytics'

  useEffect(() => {
    // Start price update interval
    const interval = setInterval(() => {
      dispatch(updateStockPrices());
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    // Update portfolio prices when stock prices change
    if (stocks && Array.isArray(stocks)) {
      dispatch(updatePortfolioPrices(stocks));
    }
  }, [stocks, dispatch]);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Trading Dashboard</h1>
        
        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={activeView === 'trading' ? 'active' : ''}
            onClick={() => setActiveView('trading')}
          >
            Trading View
          </button>
          <button 
            className={activeView === 'analytics' ? 'active' : ''}
            onClick={() => setActiveView('analytics')}
          >
            Analytics View
          </button>
        </div>
      </div>
      
      {activeView === 'trading' ? (
        <>
          {/* User Info Section */}
          <div className="card">
            <h3>Account Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <strong>Username:</strong> {user?.username}
              </div>
              <div>
                <strong>Wallet Balance:</strong> <span style={{ color: '#28a745', fontSize: '1.2rem' }}>${user?.wallet_balance}</span>
              </div>
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Left Column: Stock List */}
            <div>
              <StockList />
            </div>

            {/* Right Column: Trading Form */}
            <div>
              <TradingForm />
            </div>
          </div>

          {/* Bottom Section: Portfolio and Wallet */}
          <div className="dashboard-grid">
            <Portfolio />
            <WalletManager />
          </div>
        </>
      ) : (
        <PortfolioAnalytics />
      )}
    </div>
  );
};

export default Dashboard;
