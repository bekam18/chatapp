import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { demoCurrentUser } from '../services/demoData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const IS_DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'production';

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          if (IS_DEMO_MODE) {
            // In demo mode, just use the demo user
            setUser(demoCurrentUser);
          } else {
            const response = await authAPI.getProfile();
            setUser(response.data);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [IS_DEMO_MODE]);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      const message = IS_DEMO_MODE 
        ? 'Demo Mode: Login successful! (Using demo data)' 
        : (error.response?.data?.message || 'Login failed');
      
      if (IS_DEMO_MODE) {
        // In demo mode, simulate successful login
        localStorage.setItem('token', 'demo-token');
        setUser(demoCurrentUser);
        return { success: true };
      } else {
        setError(message);
        return { success: false, error: message };
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.register(username, email, password);
      const { user, token } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      const message = IS_DEMO_MODE 
        ? 'Demo Mode: Registration successful! (Using demo data)' 
        : (error.response?.data?.message || 'Registration failed');
      
      if (IS_DEMO_MODE) {
        // In demo mode, simulate successful registration
        localStorage.setItem('token', 'demo-token');
        setUser({ ...demoCurrentUser, username, email });
        return { success: true };
      } else {
        setError(message);
        return { success: false, error: message };
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!IS_DEMO_MODE) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};