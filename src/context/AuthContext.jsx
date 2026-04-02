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
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse user:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signup = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      joinedDate: new Date().toISOString()
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(newUser));
    return true;
  };

  const login = (email, password) => {
    // Check in users array (for existing users)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === email && u.password === password);
    
    if (existingUser) {
      setUser(existingUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(existingUser));
      return true;
    }
    
    // Fallback to single user check
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === email && user.password === password) {
        setUser(user);
        setIsAuthenticated(true);
        return true;
      }
    }
    return false;
  };

  // OTP LOGIN - NEW FUNCTION
  const otpLogin = (mobileNumber, userData = null) => {
    console.log('otpLogin called with:', mobileNumber, userData);
    
    let userToSet;
    
    if (userData) {
      // User data passed from Auth.jsx
      userToSet = userData;
    } else {
      // Check if user exists with this phone number
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let existingUser = users.find(u => u.phone === mobileNumber);
      
      if (existingUser) {
        userToSet = existingUser;
      } else {
        // Create new user for OTP login
        userToSet = {
          id: Date.now(),
          phone: mobileNumber,
          name: `User ${mobileNumber.slice(-4)}`,
          email: `${mobileNumber}@phone.user`,
          joinedDate: new Date().toISOString()
        };
        
        // Save to users list
        const updatedUsers = [...users, userToSet];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
    }
    
    // Set user in state and localStorage
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
    localStorage.removeItem('user');
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Also update in users array
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
    otpLogin,  // ADD THIS
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};