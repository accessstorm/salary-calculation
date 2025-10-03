import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const initAuth = () => {
      // Check if user is already logged in as guest
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        setUser(JSON.parse(guestUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest-user',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'hr',
      isGuest: true
    };
    
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    setUser(guestUser);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('guestUser');
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    loginAsGuest,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

