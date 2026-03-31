// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // For demo purposes, if no user exists, create a default one
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      // Create a default user for testing
      const defaultUser = {
        id: Date.now(),
        name: 'Demo User',
        email: 'demo@example.com',
        password: '123456',
        phone: '1234567890',
        address: '123 Demo Street',
        joinedDate: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(defaultUser));
      setSuccess('Demo account created! Use demo@example.com / 123456');
      setTimeout(() => setSuccess(''), 3000);
    }

    const success = login(formData.email, formData.password);
    
    if (success) {
      // Show success message
      setSuccess('Login successful! Redirecting...');
      // Redirect to home after 1 second
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setError('Invalid email or password. Try demo@example.com / 123456');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back!</h2>
        <p>Login to continue ordering</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="auth-btn">Login</button>
        </form>
        
        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: demo@example.com</p>
          <p>Password: 123456</p>
        </div>
        
        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;