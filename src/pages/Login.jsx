// pages/Login.jsx
import React, { useState, useEffect } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
 const [loginMethod, setLoginMethod] = useState('backend');

  const navigate = useNavigate();
  const { otpLogin, login: backendLogin } = useAuth();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6;

  // Clean up timers
  useEffect(() => {
    return () => {
      if (window._resendTimer) clearInterval(window._resendTimer);
    };
  }, []);

  // BACKEND LOGIN (NEW)
  const handleBackendLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { email, password } = formData;

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://modern-restaurant-website.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

     if (response.ok) {
  // ✅ Save token and user data
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  setSuccess('Login successful! Redirecting...');

  setTimeout(() => {
    window.location.reload(); // ✅ FIX
  }, 1000);

      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot connect to server. Please make sure the backend is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: SEND OTP (EXISTING CODE - UNCHANGED)
  const handleSendOTP = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { email, password } = formData;

    if (!isValidEmail(email)) {
      setError('Enter valid email');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const userData = { email, password };
    const otpData = {
      otp: generatedOtp,
      email,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    localStorage.setItem('temp_user', JSON.stringify(userData));
    localStorage.setItem('otp_data', JSON.stringify(otpData));
    setTempUser(userData);

    setTimeout(() => {
      setLoading(false);
      setSuccess(`OTP sent! Demo OTP: ${generatedOtp}`);
      setStep(2);

      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      window._resendTimer = timer;
      
      setTimeout(() => setSuccess(''), 5000);
    }, 1000);
  };

  // STEP 2: VERIFY OTP (EXISTING CODE - UNCHANGED)
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setSuccess('Verifying OTP...');

    const storedOtpData = JSON.parse(localStorage.getItem('otp_data'));
    const storedUser = JSON.parse(localStorage.getItem('temp_user'));

    if (!storedOtpData || !storedUser) {
      setError('Session expired. Please login again.');
      setLoading(false);
      setStep(1);
      setOtp('');
      return;
    }

    if (Date.now() > storedOtpData.expiresAt) {
      setError('OTP has expired. Please request a new one.');
      localStorage.removeItem('otp_data');
      localStorage.removeItem('temp_user');
      setLoading(false);
      setStep(1);
      setOtp('');
      return;
    }

    if (storedOtpData.otp !== otp) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    // OTP is correct - proceed with login
    setSuccess('OTP verified! Logging you in...');

    // Get existing users or create new
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let existingUser = users.find(u => u.email === storedUser.email);
    let currentUser;

    if (!existingUser) {
      // Create new user
      currentUser = {
        id: Date.now(),
        name: storedUser.email.split('@')[0],
        email: storedUser.email,
        password: storedUser.password,
        phone: '',
        address: '',
        joinedDate: new Date().toISOString()
      };
      users.push(currentUser);
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      currentUser = existingUser;
    }

    // Set user in auth context
    otpLogin(currentUser.phone || storedUser.email, currentUser);

    // Cleanup temp data
    localStorage.removeItem('otp_data');
    localStorage.removeItem('temp_user');

    // Clear any timers
    if (window._resendTimer) {
      clearInterval(window._resendTimer);
      window._resendTimer = null;
    }

    // Redirect to menu page immediately
    setTimeout(() => {
      navigate('/menu');
    }, 500);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) {
      setError(`Please wait ${resendTimer} seconds`);
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('temp_user'));
    if (!storedUser) {
      setError('Session expired. Please start over.');
      setStep(1);
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    localStorage.setItem('otp_data', JSON.stringify({
      otp: newOtp,
      email: storedUser.email,
      expiresAt: Date.now() + 5 * 60 * 1000
    }));

    setSuccess(`New OTP sent! Demo OTP: ${newOtp}`);
    
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    window._resendTimer = timer;
    
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* Login Method Tabs */}
        <div className="login-method-tabs">
          <button 
            className={`method-tab ${loginMethod === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('otp');
              setStep(1);
              setError('');
              setSuccess('');
              setOtp('');
              setLoading(false);
            }}
          >
            OTP Login
          </button>
          <button 
            className={`method-tab ${loginMethod === 'backend' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('backend');
              setError('');
              setSuccess('');
              setLoading(false);
            }}
          >
            Email Login
          </button>
        </div>

        {loginMethod === 'otp' ? (
          // OTP LOGIN SECTION (EXISTING CODE - UNCHANGED)
          step === 1 ? (
            <>
              <h2>Welcome Back!</h2>
              <p>Login to continue ordering</p>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSendOTP}>
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
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="password-input"
                      required
                      placeholder="Enter your password (min 6 chars)"
                    />
                    <button 
                      type="button" 
                      className="eye-button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <small className="password-hint">Password must be at least 6 characters</small>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Login with OTP'}
                </button>
              </form>

              <div className="demo-info">
                <p>✨ Demo: demo@example.com / 123456</p>
              </div>

              <p className="auth-link">
                New user? <Link to="/signup">Sign up</Link>
              </p>
            </>
          ) : (
            <>
              <h2>Verify OTP</h2>
              <p>Enter the 6-digit code sent to <strong>{tempUser?.email || 'your email'}</strong></p>

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
                  />
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
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
                      setResendTimer(0);
                      localStorage.removeItem('otp_data');
                      localStorage.removeItem('temp_user');
                      if (window._resendTimer) {
                        clearInterval(window._resendTimer);
                        window._resendTimer = null;
                      }
                    }}
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>

              <p className="auth-link">
                New user? <Link to="/signup">Sign up</Link>
              </p>
            </>
          )
        ) : (
          // BACKEND LOGIN SECTION (NEW)
          <>
            <h2>Welcome Back!</h2>
            <p>Login to continue ordering</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleBackendLogin}>
              <div className="form-group">
                <label>Email Address</label>
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
                    className="password-input"
                    required
                    placeholder="Enter your password (min 6 chars)"
                    autoComplete="off"
                  />
                  <button 
                    type="button" 
                    className="eye-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <small className="password-hint">Password must be at least 6 characters</small>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="demo-info">
              <p><strong>✨ Demo Credentials:</strong></p>
              <p>Email: demo@example.com</p>
              <p>Password: 123456</p>
              <p style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>⚠️ Make sure backend is running on port 5000</p>
            </div>

            <p className="auth-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;