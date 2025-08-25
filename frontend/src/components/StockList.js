import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateStockPrices, selectStock } from '../store/slices/stocksSlice';

const StockList = () => {
  const dispatch = useAppDispatch();
  const { stocks, selectedStock, loading, error } = useAppSelector((state) => state.stocks);

  useEffect(() => {
    // Start live price updates
    const interval = setInterval(() => {
      dispatch(updateStockPrices());
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStockSelect = (stock) => {
    dispatch(selectStock(stock));
  };

  if (loading) return <div>Loading stocks...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="card">
      <h3>📊 Live Stock Prices</h3>
      <div className="stock-list">
        {stocks.map((stock) => (
          <div 
            key={stock.symbol} 
            className={`stock-item ${selectedStock?.symbol === stock.symbol ? 'selected' : ''}`}
            onClick={() => handleStockSelect(stock)}
            style={{ 
              cursor: 'pointer',
              backgroundColor: selectedStock?.symbol === stock.symbol ? '#e3f2fd' : 'transparent',
              borderRadius: '4px'
            }}
          >
            <div>
              <div className="stock-symbol">{stock.symbol}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{stock.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="stock-price">${stock.price}</div>
              <div 
                className={stock.change >= 0 ? 'price-up' : 'price-down'}
                style={{ fontSize: '0.8rem' }}
              >
                {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
        💡 Click on a stock to select it for trading
      </div>
    </div>
  );
};

export default StockList;
