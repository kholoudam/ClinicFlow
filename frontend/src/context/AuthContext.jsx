import { createContext, useContext, useEffect, useState } from 'react';

import { api, setLogoutHandler } from '../services/api';

const C = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('clinicflow_token');
    setUser(null);
  };

  useEffect(() => {
    setLogoutHandler(logout);

    const token = localStorage.getItem('clinicflow_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', {
      email,
      password
    });

    localStorage.setItem('clinicflow_token', r.data.token);
    setUser(r.data.user);
  };

  return (
    <C.Provider value={{ user, loading, login, logout }}>
      {children}
    </C.Provider>
  );
}

export const useAuth = () => useContext(C);