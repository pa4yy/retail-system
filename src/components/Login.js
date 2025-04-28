import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { users } from '../data/FakeData';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(u => 
      u.username === formData.username && 
      u.password === formData.password
    );

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/sale', { state: { user } });
    } else {
      alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-title">
          <div className="shop-name">ShopEase</div>
          <div className="login-subtitle">Login</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;