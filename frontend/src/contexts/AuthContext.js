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


  // Authentication logic is commented out for guest mode
  useEffect(() => {
    setUser(guestUser);
    setLoading(false);
  }, []);

  // Guest mode: login does nothing
  const login = async () => {
    setUser(guestUser);
    setLoading(false);
    return { user: guestUser };
  };

  // Guest mode: register does nothing
  const register = async () => {
    setUser(guestUser);
    setLoading(false);
    return { user: guestUser };
  };

  // Guest mode: logout just sets guest
  const logout = () => {
    setUser(guestUser);
  };

  // Guest mode: updateProfile does nothing
  const updateProfile = async () => {
    setUser(guestUser);
    return guestUser;
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
