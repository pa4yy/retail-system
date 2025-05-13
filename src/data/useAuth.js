import { useLocation } from 'react-router-dom';

export const useAuth = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem('user');
  const user = location.state?.user || (storedUser ? JSON.parse(storedUser) : null);

  console.log('Current user in useAuth:', user);

  const setUser = (userData) => {
    console.log('Setting user data:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return { user, setUser, logout };
};