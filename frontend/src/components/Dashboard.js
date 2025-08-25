import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateStockPrices } from '../store/slices/stocksSlice';
import { updatePortfolioPrices } from '../store/slices/portfolioSlice';
import StockList from './StockList';
import TradingForm from './TradingForm';
import Portfolio from './Portfolio';
import WalletManager from './WalletManager';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stocks } = useAppSelector((state) => state.stocks);

  useEffect(() => {
    // Start price update interval
    const interval = setInterval(() => {
      dispatch(updateStockPrices());
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    // Update portfolio prices when stock prices change
    dispatch(updatePortfolioPrices(stocks));
  }, [stocks, dispatch]);

  return (
    <div>
      <h1>Trading Dashboard</h1>
      
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
    </div>
  );
};

export default Dashboard;
