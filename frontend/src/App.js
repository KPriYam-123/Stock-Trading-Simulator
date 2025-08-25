import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { fetchUserProfile } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { token, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      // Set token in API headers and fetch user profile
      import('./services/api').then(({ default: api }) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      });
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
