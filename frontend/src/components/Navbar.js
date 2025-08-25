import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          📈 Trading Simulator
        </div>
        <div className="navbar-nav">
          {isAuthenticated && user ? (
            <>
              <span>Welcome, {user.username}</span>
              <span>Balance: ${user.wallet_balance}</span>
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="nav-link">Login</a>
              <a href="/register" className="nav-link">Register</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
