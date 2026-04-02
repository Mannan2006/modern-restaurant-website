// pages/Signup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      const timer = window._resendTimer;
      if (timer) clearInterval(timer);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword, phone } = formData;

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (phone && phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      setError('User already exists with this email. Please login.');
      setLoading(false);
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    localStorage.setItem('signup_temp', JSON.stringify(formData));
    localStorage.setItem('signup_otp', otpCode);
    localStorage.setItem('signup_otp_expiry', Date.now() + 5 * 60 * 1000);

    setTimeout(() => {
      setLoading(false);
      setSuccess(`OTP sent to ${email}. Demo OTP: ${otpCode}`);
      setStep(2);
      
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            window._resendTimer = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      window._resendTimer = timer;
      
      setTimeout(() => setSuccess(''), 5000);
    }, 1000);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) {
      setError(`Please wait ${resendTimer} seconds before requesting again`);
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('signup_temp'));
    if (!storedUser) {
      setError('Session expired. Please start over.');
      setStep(1);
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('signup_otp', newOtp);
    localStorage.setItem('signup_otp_expiry', Date.now() + 5 * 60 * 1000);
    
    setSuccess(`New OTP sent! Demo OTP: ${newOtp}`);
    
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window._resendTimer = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    window._resendTimer = timer;
    
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setSuccess('Verifying OTP...');

    const storedOtp = localStorage.getItem('signup_otp');
    const storedExpiry = localStorage.getItem('signup_otp_expiry');
    const userData = JSON.parse(localStorage.getItem('signup_temp'));

    if (!storedOtp || !userData) {
      setError('Session expired. Please start over.');
      setLoading(false);
      setStep(1);
      return;
    }

    if (Date.now() > parseInt(storedExpiry)) {
      setError('OTP has expired. Please request a new one.');
      localStorage.removeItem('signup_otp');
      localStorage.removeItem('signup_otp_expiry');
      setLoading(false);
      setStep(1);
      setOtp('');
      return;
    }

    if (otp !== storedOtp) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    // OTP Verified - Create user
    setSuccess('OTP verified! Creating account...');

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      address: userData.address || '',
      joinedDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Use signup from AuthContext
    signup(newUser);

    // Clear temp data
    localStorage.removeItem('signup_temp');
    localStorage.removeItem('signup_otp');
    localStorage.removeItem('signup_otp_expiry');

    // Clear timer
    if (window._resendTimer) {
      clearInterval(window._resendTimer);
      window._resendTimer = null;
    }

    setSuccess('Account created successfully! Redirecting to menu...');

    // Redirect to menu page after 1 second
    setTimeout(() => {
      navigate('/menu');
    }, 1000);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {step === 1 ? (
          <>
            <h2>Create Account</h2>
            <p>Join Foodies today!</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
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
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label>Address (Optional)</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your delivery address"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password (min. 6 characters)"
                    className="password-input"
                  />
                  <button 
                    type="button"
                    className="eye-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="2" y1="2" x2="22" y2="22"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <small className="password-hint">Password must be at least 6 characters</small>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    className="password-input"
                  />
                  <button 
                    type="button"
                    className="eye-button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="2" y1="2" x2="22" y2="22"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Sign Up with OTP'}
              </button>
            </form>

            <p className="auth-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to <strong>{formData.email || 'your email'}</strong></p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  autoFocus
                  style={{
                    color: '#000',
                    backgroundColor: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    letterSpacing: '4px'
                  }}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="otp-actions">
                <button 
                  type="button" 
                  className={`resend-btn ${resendTimer > 0 ? 'disabled' : ''}`}
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setSuccess('');
                    setLoading(false);
                    if (window._resendTimer) {
                      clearInterval(window._resendTimer);
                      window._resendTimer = null;
                    }
                    setResendTimer(0);
                  }}
                >
                  ← Back
                </button>
              </div>
            </form>

            <p className="auth-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;