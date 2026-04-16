// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // BACKEND SIGNUP
  const signup = async (userData) => {
    try {
      const response = await fetch('https://modern-restaurant-website.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Signup response:', data);
      
      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      console.error('Signup failed:', data.message);
      return false;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  // BACKEND LOGIN
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      console.error('Login failed:', data.message);
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // OTP LOGIN - Keep existing functionality
  const otpLogin = (mobileNumber, userData = null) => {
    console.log('otpLogin called with:', mobileNumber, userData);
    
    let userToSet;
    
    if (userData) {
      userToSet = userData;
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let existingUser = users.find(u => u.phone === mobileNumber);
      
      if (existingUser) {
        userToSet = existingUser;
      } else {
        userToSet = {
          id: Date.now(),
          phone: mobileNumber,
          name: `User ${mobileNumber.slice(-4)}`,
          email: `${mobileNumber}@phone.user`,
          joinedDate: new Date().toISOString()
        };
        
        const updatedUsers = [...users, userToSet];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
    }
    
    setUser(userToSet);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userToSet));
    
    console.log('User set in AuthContext:', userToSet);
    console.log('isAuthenticated set to true');
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (updatedData) => {
    // Try backend update first
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
    
    // Fallback to localStorage update
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
    return true;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    signup,
    login,
    otpLogin,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};