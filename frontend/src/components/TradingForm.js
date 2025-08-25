import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { placeOrder } from '../store/slices/tradesSlice';
import { updateUser } from '../store/slices/authSlice';
import api from '../services/api';

const TradingForm = () => {
  const dispatch = useAppDispatch();
  const { selectedStock } = useAppSelector((state) => state.stocks);
  
  const [orderData, setOrderData] = useState({
    quantity: '',
    orderType: 'market', // market or limit
    limitPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    if (!selectedStock || !orderData.quantity) return 0;
    const price = orderData.orderType === 'limit' ? parseFloat(orderData.limitPrice) || 0 : selectedStock.price;
    return (price * parseFloat(orderData.quantity)).toFixed(2);
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    if (!selectedStock) {
      setMessage('Please select a stock first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const tradeData = {
        symbol: selectedStock.symbol,
        quantity: parseInt(orderData.quantity),
        order_type: action,
        price_type: orderData.orderType,
        limit_price: orderData.orderType === 'limit' ? parseFloat(orderData.limitPrice) : null
      };

      const result = await dispatch(placeOrder(tradeData)).unwrap();
      
      setMessage(`✅ Successfully placed ${action.toUpperCase()} order for ${result.quantity} shares of ${result.symbol} at $${result.price} each. Total: $${result.total}`);
      
      // Refresh user data to update wallet balance
      const userResponse = await api.get('/users/me');
      dispatch(updateUser(userResponse.data));

      // Reset form
      setOrderData({
        quantity: '',
        orderType: 'market',
        limitPrice: '',
      });

    } catch (error) {
      setMessage(`Error placing order: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStock) {
    return (
      <div className="card">
        <h3>📈 Place Order</h3>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Select a stock from the list to start trading
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>📈 Place Order - {selectedStock.symbol}</h3>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>{selectedStock.name}</strong><br />
        Current Price: <span style={{ color: '#007bff', fontSize: '1.1rem' }}>${selectedStock.price}</span>
      </div>

      <form className="trading-form">
        <div className="form-group">
          <label htmlFor="quantity">Quantity (shares)</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={orderData.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="orderType">Order Type</label>
          <select
            id="orderType"
            name="orderType"
            value={orderData.orderType}
            onChange={handleChange}
          >
            <option value="market">Market Order</option>
            <option value="limit">Limit Order</option>
          </select>
        </div>

        {orderData.orderType === 'limit' && (
          <div className="form-group">
            <label htmlFor="limitPrice">Limit Price ($)</label>
            <input
              type="number"
              id="limitPrice"
              name="limitPrice"
              value={orderData.limitPrice}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />
          </div>
        )}

        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
          <strong>Estimated Total: ${calculateTotal()}</strong>
        </div>

        {message && (
          <div className={message.includes('✅') ? 'success' : 'error'} style={{ marginBottom: '15px' }}>
            {message}
          </div>
        )}

        <div className="form-row">
          <button 
            type="button"
            className="btn btn-success"
            onClick={(e) => handleSubmit(e, 'buy')}
            disabled={loading || !orderData.quantity}
            style={{ width: '100%' }}
          >
            {loading ? 'Processing...' : 'BUY'}
          </button>
          <button 
            type="button"
            className="btn btn-danger"
            onClick={(e) => handleSubmit(e, 'sell')}
            disabled={loading || !orderData.quantity}
            style={{ width: '100%' }}
          >
            {loading ? 'Processing...' : 'SELL'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradingForm;
