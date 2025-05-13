import { useLocation } from 'react-router-dom';

export const useAuth = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem('user');
  const user = location.state?.user || (storedUser ? JSON.parse(storedUser) : null);

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return { user, logout };
};