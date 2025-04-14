import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/api/auth/register', formData);
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        await loadUser();
        toast.success('Registration successful!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Registration error:', err);
      let errorMsg = 'Registration failed';
      
      if (err.response) {
        if (err.response.data.errors && err.response.data.errors.length > 0) {
          errorMsg = err.response.data.errors[0].msg;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
        console.log('Error response:', err.response.data);
      }
      
      toast.error(errorMsg);
      return false;
    }
  };

  const login = async (formData) => {
    try {
      const res = await api.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      await loadUser();
      toast.success('Login successful!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/api/auth/me', formData);
      setUser(res.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Profile update failed');
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/api/auth/forgot-password', { email });
      toast.success('Password reset email sent. Please check your inbox.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Failed to send reset email');
      return false;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successful. Please login with your new password.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Password reset failed');
      return false;
    }
  };

  const verifyEmail = async (token) => {
    try {
      await api.get(`/api/auth/verify-email?token=${token}`);
      toast.success('Email verified successfully');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Email verification failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 