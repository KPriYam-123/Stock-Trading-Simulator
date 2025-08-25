import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updatePortfolioPrices } from '../store/slices/portfolioSlice';

const Portfolio = () => {
  const dispatch = useAppDispatch();
  const { holdings, loading, error } = useAppSelector((state) => state.portfolio);

  useEffect(() => {
    // Initialize with mock data or fetch from API if needed
    // For now, we'll just update prices when stocks change
    const interval = setInterval(() => {
      dispatch(updatePortfolioPrices());
    }, 3000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const calculateValue = (item) => {
    return (item.shares * item.currentPrice).toFixed(2);
  };

  const calculateGainLoss = (item) => {
    const currentValue = item.shares * item.currentPrice;
    const investedValue = item.shares * item.avgPrice;
    const gainLoss = currentValue - investedValue;
    const percentage = ((gainLoss / investedValue) * 100).toFixed(2);
    return { amount: gainLoss.toFixed(2), percentage };
  };

  const getTotalPortfolioValue = () => {
    return holdings.reduce((total, item) => total + (item.shares * item.currentPrice), 0).toFixed(2);
  };

  const getTotalGainLoss = () => {
    const totalCurrent = holdings.reduce((total, item) => total + (item.shares * item.currentPrice), 0);
    const totalInvested = holdings.reduce((total, item) => total + (item.shares * item.avgPrice), 0);
    const gainLoss = totalCurrent - totalInvested;
    const percentage = totalInvested > 0 ? ((gainLoss / totalInvested) * 100).toFixed(2) : 0;
    return { amount: gainLoss.toFixed(2), percentage };
  };

  if (loading) return <div>Loading portfolio...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const totalGainLoss = getTotalGainLoss();

  return (
    <div className="card">
      <h3>💼 Portfolio</h3>
      
      {/* Portfolio Summary */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <strong>Total Value:</strong> ${getTotalPortfolioValue()}
          </div>
          <div>
            <strong>Total P&L:</strong> 
            <span className={totalGainLoss.amount >= 0 ? 'price-up' : 'price-down'} style={{ marginLeft: '5px' }}>
              ${totalGainLoss.amount} ({totalGainLoss.percentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Holdings */}
      {holdings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          No holdings yet. Start trading to build your portfolio!
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {holdings.map((item) => {
            const gainLoss = calculateGainLoss(item);
            return (
              <div key={item.symbol} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 80px 100px 100px', 
                gap: '10px', 
                padding: '10px', 
                borderBottom: '1px solid #eee',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.symbol}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {item.shares} shares @ ${item.avgPrice}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  ${item.currentPrice}
                </div>
                <div style={{ textAlign: 'right' }}>
                  ${calculateValue(item)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={gainLoss.amount >= 0 ? 'price-up' : 'price-down'}>
                    ${gainLoss.amount}
                  </div>
                  <div className={gainLoss.amount >= 0 ? 'price-up' : 'price-down'} style={{ fontSize: '0.8rem' }}>
                    {gainLoss.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
