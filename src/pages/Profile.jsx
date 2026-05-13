// pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch latest user data from backend when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found');
          return;
        }
        
        console.log('📝 Fetching user data...');
        
        const response = await fetch('https://modern-restaurant-website.onrender.com/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('📝 Fetch response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data;
          console.log('📝 User data received:', userData);
          
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || ''
          });
          
          // Update AuthContext with latest data
          if (updateProfile) {
            updateProfile(userData);
          }
        } else if (response.status === 401) {
          console.log('Token expired, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    
    fetchUserData();
  }, [updateProfile, navigate]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      
      console.log('📝 Updating profile...');
      console.log('📝 Update data:', { 
        name: formData.name, 
        phone: formData.phone, 
        address: formData.address 
      });
      
      const response = await fetch('https://modern-restaurant-website.onrender.com/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || '',
          address: formData.address || ''
        })
      });
      
      console.log('📝 Update response status:', response.status);
      
      const data = await response.json();
      console.log('📝 Update response data:', data);
      
      if (response.ok && data.success) {
        // Update localStorage with new user data
        const updatedUser = data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update AuthContext with updated data
        if (updateProfile) {
          updateProfile(updatedUser);
        }
        
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format joined date safely
  const formatJoinedDate = () => {
    if (!user?.joinedDate) return 'Recently';
    try {
      return new Date(user.joinedDate).toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h1>{user.name || 'User'}</h1>
        <p>Member since {formatJoinedDate()}</p>
      </div>

      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {!isEditing ? (
          // View Mode
          <div className="profile-info">
            <div className="info-group">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            
            <div className="info-group">
              <label>Phone</label>
              <p>{user.phone || 'Not provided'}</p>
            </div>
            
            <div className="info-group">
              <label>Address</label>
              <p>{user.address || 'Not provided'}</p>
            </div>
            
            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
              <small>Email cannot be changed</small>
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your delivery address"
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;