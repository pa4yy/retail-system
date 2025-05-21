import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const [user, setUserState] = useState(storedUser ? JSON.parse(storedUser) : null);

  const setUser = (userData) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = async () => {
    if (user?.Emp_Id) {
      try {
        await axios.post('http://localhost:5000/api/logs/logout', { Emp_Id: user.Emp_Id });
      } catch (e) {
        console.error('Logout log error', e);
      }
    }
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
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