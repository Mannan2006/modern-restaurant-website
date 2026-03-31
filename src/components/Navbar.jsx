// components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar-modern ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container-modern">
        <Link to="/" className="nav-logo-modern" onClick={() => setMobileMenuOpen(false)}>
          <span className="logo-icon">🍔</span>
          <span className="logo-text">Foodies</span>
        </Link>

        <div className={`nav-menu-modern ${mobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link-modern ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          
          <Link 
            to="/menu" 
            className={`nav-link-modern ${isActive('/menu') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <i className="fas fa-utensils"></i>
            <span>Menu</span>
          </Link>
          
          {user ? (
            <>
              <Link 
                to="/cart" 
                className={`nav-link-modern cart-link ${isActive('/cart') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-shopping-cart"></i>
                <span>Cart</span>
                {getItemCount() > 0 && (
                  <span className="cart-badge-modern">{getItemCount()}</span>
                )}
              </Link>
              
              <Link 
                to="/orders" 
                className={`nav-link-modern ${isActive('/orders') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-receipt"></i>
                <span>Orders</span>
              </Link>
            </>
          ) : null}
          
          {user ? (
            <div className="profile-dropdown-modern">
              <button 
                className="profile-btn-modern"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="profile-avatar-modern">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="profile-name">{user.name?.split(' ')[0] || 'User'}</span>
                <i className={`fas fa-chevron-down ${showDropdown ? 'rotated' : ''}`}></i>
              </button>
              
              {showDropdown && (
                <div className="dropdown-content-modern">
                  <Link to="/profile" onClick={() => { setShowDropdown(false); setMobileMenuOpen(false); }}>
                    <i className="fas fa-user"></i>
                    <span>My Profile</span>
                  </Link>
                  <Link to="/orders" onClick={() => { setShowDropdown(false); setMobileMenuOpen(false); }}>
                    <i className="fas fa-receipt"></i>
                    <span>My Orders</span>
                  </Link>
                  <button onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons-modern">
              <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn-signup" onClick={() => setMobileMenuOpen(false)}>
                <i className="fas fa-user-plus"></i>
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;