import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Initial auth check failed:', err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign in. Please verify your credentials.');
      }

      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up.');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err.message);
    } finally {
      setUser(null);
    }
  };

  const verifyEmail = async (token) => {
    try {
      const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Email verification failed.');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Password recovery request failed.');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Password reset failed.');
      }

      return data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, signup, logout, verifyEmail, forgotPassword, resetPassword, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
