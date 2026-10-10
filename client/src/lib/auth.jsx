import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const signOut = useCallback(() => { setToken(null); setUser(null); }, []);

  useEffect(() => {
    if (!getToken()) return;
    api.get('/auth/me').then((d) => setUser(d.user)).catch(signOut).finally(() => setLoading(false));
  }, [signOut]);

  useEffect(() => {
    window.addEventListener('spendwise:signed-out', signOut);
    return () => window.removeEventListener('spendwise:signed-out', signOut);
  }, [signOut]);

  const finish = ({ token, user: u }) => { setToken(token); setUser(u); };
  const value = {
    user, loading, setUser, signOut,
    login: async (email, password) => finish(await api.post('/auth/login', { email, password })),
    register: async (name, email, password) => finish(await api.post('/auth/register', { name, email, password }))
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
