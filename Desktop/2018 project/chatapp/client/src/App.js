import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './App.css';

// Demo Banner Component
const DemoBanner = () => {
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'production';
  
  if (!isDemoMode) return null;
  
  return (
    <div style={{
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '8px 16px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      🚀 Demo Mode: This is a live preview of the chat interface. 
      For full functionality, run locally with backend server.
      <a 
        href="https://github.com/bekam18/chatapp" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#fff', marginLeft: '10px', textDecoration: 'underline' }}
      >
        View Source Code
      </a>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to chat if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? <Navigate to="/chat" /> : children;
};

function App() {
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'production';
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <DemoBanner />
          <PWAInstallPrompt />
          <div style={{ marginTop: isDemoMode ? '40px' : '0' }}>
            <Routes>
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
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <SocketProvider>
                      <Chat />
                    </SocketProvider>
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/chat" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
