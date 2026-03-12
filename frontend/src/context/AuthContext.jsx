import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('om_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('om_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const login = (payload) => {
    localStorage.setItem('om_token', payload.token);
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem('om_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(token && user)
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
