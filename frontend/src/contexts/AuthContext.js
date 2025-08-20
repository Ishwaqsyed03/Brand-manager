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
    // Temporarily bypass authentication: always use guest user
    setUser(guestUser);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async () => {
    setUser(guestUser);
    return { token: null, user: guestUser };
  };

  const register = async (userData) => {
    const updatedUser = {
      ...guestUser,
      username: userData?.username || guestUser.username,
      email: userData?.email || guestUser.email,
      profile: {
        ...guestUser.profile,
        name: userData?.name || guestUser.profile.name
      }
    };
    setUser(updatedUser);
    return { token: null, user: updatedUser };
  };

  const logout = () => {
    setUser(guestUser);
  };

  const updateProfile = async (profileData) => {
    const updated = {
      ...user,
      profile: {
        ...user.profile,
        ...profileData
      }
    };
    setUser(updated);
    return updated;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
