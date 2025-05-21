import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = location.state?.user || (storedUser ? JSON.parse(storedUser) : null);

  console.log('Current user in useAuth:', user);

  const setUser = (userData) => {
    console.log('Setting user data:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.Emp_Id) {
      await axios.post('http://localhost:5000/api/logs/logout', { Emp_Id: user.Emp_Id });
    }
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return { user, setUser, logout };
};