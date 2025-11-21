// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://smart-trello.onrender.com';

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/me`, { 
      withCredentials: true 
    })
      .then(res => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [API_URL]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { 
      withCredentials: true 
    });
    setUser(res.data.user);
  };

  const register = async (payload) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, payload, { 
      withCredentials: true 
    });
    setUser(res.data.user);
  };

  const logout = async () => {
    await axios.post(`${API_URL}/api/auth/logout`, {}, { 
      withCredentials: true 
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);