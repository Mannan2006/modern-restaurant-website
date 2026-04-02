// pages/Auth.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [otpData, setOtpData] = useState({
    mobile: '',
    otp: ''
  });
  const [otpStep, setOtpStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { login, signup, otpLogin } = useAuth();
  const navigate = useNavigate();

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (window._otpTimer) clearInterval(window._otpTimer);
    };
  }, []);

  // Validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6;

  // Utility Functions
  const resetForm = useCallback(() => {
    setFormData({
      name: '', email: '', password: '', confirmPassword: '', phone: '', address: ''
    });
    setOtpData({ mobile: '', otp: '' });
    setOtpStep(1);
    setError('');
    setSuccess('');
    setResendTimer(0);
    setShowPassword(false);
    setShowConfirmPassword(false);
    localStorage.removeItem('otp_login_data');
  }, []);

  const resetToEmailLogin = useCallback(() => {
    setLoginMethod('email');
    setOtpStep(1);
    setOtpData({ mobile: '', otp: '' });
    setError('');
    setSuccess('');
    setResendTimer(0);
    localStorage.removeItem('otp_login_data');
  }, []);

  // Password Eye Component
  const PasswordEye = ({ isVisible, onToggle }) => (
    <button type="button" className="eye-button" onClick={onToggle}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
        {!isVisible && (
          <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeLinejoin="round"/>
        )}
      </svg>
    </button>
  );

  // OTP Input Component
  const OTPInput = ({ value, onChange, maxLength = 6 }) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, maxLength))}
      placeholder="Enter 6-digit code"
      maxLength={maxLength}
      required
      autoFocus
      className="otp-input"
      style={{
        color: '#000',
        backgroundColor: '#fff',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: '4px',
        padding: '12px'
      }}
    />
  );

  // Handlers
  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const formatPhone = (value) => value.replace(/\D/g, '').slice(0, 10);

  // SEND OTP
  const handleSendOTP = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { mobile } = otpData;
    
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpStorage = {
      otp: otpCode,
      mobile: mobile,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    localStorage.setItem('otp_login_data', JSON.stringify(otpStorage));

    setTimeout(() => {
      setLoading(false);
      setSuccess(`OTP sent to ${mobile}. Demo OTP: ${otpCode}`);
      setOtpStep(2);
      
      setResendTimer(60);
      if (window._otpTimer) clearInterval(window._otpTimer);
      window._otpTimer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(window._otpTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimeout(() => setSuccess(''), 5000);
    }, 1000);
  };

  // VERIFY OTP - FIXED WITH BETTER REDIRECT
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { otp } = otpData;
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setSuccess('Verifying OTP...');

    const storedOtpData = JSON.parse(localStorage.getItem('otp_login_data') || 'null');

    if (!storedOtpData) {
      setError('Session expired. Please request OTP again.');
      setLoading(false);
      setOtpStep(1);
      setOtpData({ mobile: '', otp: '' });
      return;
    }

    if (Date.now() > storedOtpData.expiresAt) {
      setError('OTP has expired. Please request a new one.');
      localStorage.removeItem('otp_login_data');
      setLoading(false);
      setOtpStep(1);
      setOtpData({ mobile: '', otp: '' });
      return;
    }

    if (storedOtpData.otp !== otp) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    // OTP is correct - Login user
    setSuccess('OTP verified! Logging you in...');

    // Get or create user with this phone number
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let existingUser = users.find(u => u.phone === storedOtpData.mobile);
    let currentUser;

    if (!existingUser) {
      currentUser = {
        id: Date.now(),
        name: `User ${storedOtpData.mobile.slice(-4)}`,
        email: `${storedOtpData.mobile}@phone.user`,
        phone: storedOtpData.mobile,
        address: '',
        joinedDate: new Date().toISOString()
      };
      users.push(currentUser);
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      currentUser = existingUser;
    }

    // Use otpLogin from context
    const loginSuccess = otpLogin(storedOtpData.mobile, currentUser);
    
    if (loginSuccess) {
      localStorage.removeItem('otp_login_data');
      if (window._otpTimer) clearInterval(window._otpTimer);
      
      setSuccess('Login successful! Redirecting to menu...');
      
      // FORCE REDIRECT TO MENU PAGE
      setTimeout(() => {
        window.location.href = '/menu';
      }, 500);
    } else {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOTP = () => {
    if (resendTimer > 0) {
      setError(`Please wait ${resendTimer} seconds before requesting again`);
      return;
    }

    const { mobile } = otpData;
    
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpStorage = {
      otp: newOtp,
      mobile: mobile,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    localStorage.setItem('otp_login_data', JSON.stringify(otpStorage));

    setSuccess(`New OTP sent! Demo OTP: ${newOtp}`);
    
    setResendTimer(60);
    if (window._otpTimer) clearInterval(window._otpTimer);
    window._otpTimer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(window._otpTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimeout(() => setSuccess(''), 5000);
  };

  // SIGNUP
  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword, phone, address } = formData;

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
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
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      setError('User already exists. Please login.');
      setLoading(false);
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      password: password,
      phone: phone || '',
      address: address || '',
      joinedDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    signup(newUser);

    setTimeout(() => {
      setLoading(false);
      setSuccess('Account created! Redirecting to menu...');
      setTimeout(() => {
        window.location.href = '/menu';
      }, 1000);
    }, 1000);
  };

  // EMAIL LOGIN
  const handleEmailLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { email, password } = formData;

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === email && u.password === password);

    if (existingUser) {
      login(email, password);
      setTimeout(() => {
        setLoading(false);
        setSuccess('Login successful! Redirecting to menu...');
        setTimeout(() => {
          window.location.href = '/menu';
        }, 1000);
      }, 1000);
    } else {
      setLoading(false);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <h1>🍔 Foodies</h1>
          <p>Sign in to continue</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              resetForm();
              resetToEmailLogin();
            }}
          >
            Sign in
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              resetForm();
              resetToEmailLogin();
            }}
          >
            Create account
          </button>
        </div>

        {isLogin ? (
          <>
            <div className="login-method-tabs">
              <button 
                className={`method-tab ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => setLoginMethod('email')}
              >
                Email
              </button>
              <button 
                className={`method-tab ${loginMethod === 'otp' ? 'active' : ''}`}
                onClick={() => setLoginMethod('otp')}
              >
                Phone
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form onSubmit={handleEmailLogin}>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    autoComplete="off"
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
                      placeholder="Enter your password"
                      className="password-input"
                      autoComplete="off"
                    />
                    <PasswordEye 
                      isVisible={showPassword} 
                      onToggle={() => setShowPassword(!showPassword)} 
                    />
                  </div>
                </div>
                
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                
                <div className="demo-info">
                  <p>✨ Demo: demo@example.com / 123456</p>
                </div>
              </form>
            ) : (
              <>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                {otpStep === 1 ? (
                  <form onSubmit={handleSendOTP}>
                    <div className="form-group">
                      <label>Phone number</label>
                      <div className="mobile-input-wrapper">
                        <span className="country-code">+91</span>
                        <input
                          type="tel"
                          value={otpData.mobile}
                          onChange={(e) => setOtpData({ ...otpData, mobile: formatPhone(e.target.value) })}
                          placeholder="Enter 10-digit mobile number"
                          maxLength="10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                      {loading ? 'Sending...' : 'Send verification code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="form-group">
                      <label>Verification code</label>
                      <OTPInput
                        value={otpData.otp}
                        onChange={(otp) => setOtpData({ ...otpData, otp })}
                      />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify & Sign in'}
                    </button>
                    
                    <div className="otp-actions">
                      <button 
                        type="button" 
                        className={`resend-btn ${resendTimer > 0 ? 'disabled' : ''}`}
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || loading}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                      </button>
                      <button 
                        type="button" 
                        className="back-btn"
                        onClick={() => {
                          setOtpStep(1);
                          setOtpData({ mobile: otpData.mobile, otp: '' });
                          setError('');
                          setSuccess('');
                          setResendTimer(0);
                          if (window._otpTimer) clearInterval(window._otpTimer);
                        }}
                      >
                        Use different number
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </>
        ) : (
          <form onSubmit={handleSignup}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label>Full name</label>
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
              <label>Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: formatPhone(e.target.value)
                }))}
                placeholder="10-digit mobile number"
                maxLength="10"
              />
            </div>
            
            <div className="form-group">
              <label>Address (optional)</label>
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
                  placeholder="Create a password"
                  className="password-input"
                />
                <PasswordEye 
                  isVisible={showPassword} 
                  onToggle={() => setShowPassword(!showPassword)} 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Confirm password</label>
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
                <PasswordEye 
                  isVisible={showConfirmPassword} 
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)} 
                />
              </div>
              <small className="password-hint">Must be at least 6 characters</small>
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            
            <p className="auth-link">
              Already have an account? <Link to="#" onClick={() => setIsLogin(true)}>Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;