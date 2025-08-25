import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateUser } from '../store/slices/authSlice';
import api from '../services/api';

const WalletManager = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTransaction = async (type) => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.post('/users/wallet/update', {
        amount: parseFloat(amount),
        transaction_type: type,
        description: `Wallet ${type} via dashboard`
      });

      setMessage(`✅ Successfully ${type === 'deposit' ? 'deposited' : 'withdrew'} $${amount}`);
      setAmount('');

      // Refresh user data
      const userResponse = await api.get('/users/me');
      dispatch(updateUser(userResponse.data));

    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>💳 Wallet Management</h3>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong>Current Balance: </strong>
        <span style={{ color: '#28a745', fontSize: '1.2rem' }}>${user?.wallet_balance}</span>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount ($)</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="0.01"
          step="0.01"
        />
      </div>

      {message && (
        <div className={message.includes('✅') ? 'success' : 'error'} style={{ marginBottom: '15px' }}>
          {message}
        </div>
      )}

      <div className="form-row">
        <button 
          className="btn btn-success"
          onClick={() => handleTransaction('deposit')}
          disabled={loading || !amount}
          style={{ width: '100%' }}
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
        <button 
          className="btn"
          onClick={() => handleTransaction('withdrawal')}
          disabled={loading || !amount}
          style={{ width: '100%', backgroundColor: '#ffc107', color: '#000' }}
        >
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>
        💡 Use this to add or remove funds from your trading account
      </div>
    </div>
  );
};

export default WalletManager;
