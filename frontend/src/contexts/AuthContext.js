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
  const guestUser = {
    id: 'guest',
    username: 'guest',
    email: 'guest@local',
    profile: {
      name: 'Guest',
      bio: '',
      avatar: ''
    },
    socialConnections: {
      twitter: { connected: false },
      linkedin: { connected: false },
      instagram: { connected: false },
      facebook: { connected: false }
    }
  };

  const [user, setUser] = useState(guestUser);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setUser(guestUser);
          setLoading(false);
        });
    } else {
      setUser(guestUser);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setLoading(false);
        return { token: data.token, user: data.user };
      } else {
        setLoading(false);
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setLoading(false);
        return { token: data.token, user: data.user };
      } else {
        setLoading(false);
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(guestUser);
  };

  const updateProfile = async (profileData) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    setUser(data);
    return data;
  };

  // Social login stubs (to be implemented)
  const socialLogin = async (platform) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `/oauth/${platform}`;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    socialLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
