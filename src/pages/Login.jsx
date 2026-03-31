// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6;

  // 🔥 STEP 1: SEND OTP
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

    const userData = {
      email,
      password
    };

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
      setSuccess(`OTP sent! (Demo OTP: ${generatedOtp})`);
      setStep(2);

      // Timer
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
    }, 1000);
  };

  // 🔥 STEP 2: VERIFY OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const storedOtpData = JSON.parse(localStorage.getItem('otp_data'));
    const storedUser = JSON.parse(localStorage.getItem('temp_user'));

    if (!storedOtpData || !storedUser) {
      setError('Session expired');
      setStep(1);
      return;
    }

    if (Date.now() > storedOtpData.expiresAt) {
      setError('OTP expired');
      setStep(1);
      return;
    }

    if (storedOtpData.otp !== otp) {
      setError('Invalid OTP');
      return;
    }

    // 🔥 SAVE USER PROPERLY
    let users = JSON.parse(localStorage.getItem('users') || '[]');

    let existingUser = users.find(u => u.email === storedUser.email);

    let currentUser;

    if (!existingUser) {
      // New user
      currentUser = {
        id: Date.now(),
        name: storedUser.email.split('@')[0],
        email: storedUser.email,
        phone: '',
        address: '',
        joinedDate: new Date().toISOString()
      };

      users.push(currentUser);
      localStorage.setItem('users', JSON.stringify(users));
    } else {
      // Existing user
      currentUser = existingUser;
    }

    // Save current session
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      loginTime: new Date().toISOString()
    }));

    // Cleanup
    localStorage.removeItem('otp_data');
    localStorage.removeItem('temp_user');

    setSuccess('Login successful!');

    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;

    const storedUser = JSON.parse(localStorage.getItem('temp_user'));
    if (!storedUser) return;

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    localStorage.setItem('otp_data', JSON.stringify({
      otp: newOtp,
      email: storedUser.email,
      expiresAt: Date.now() + 5 * 60 * 1000
    }));

    setSuccess(`New OTP: ${newOtp}`);
    setResendTimer(60);
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

        {step === 1 ? (
          <>
            <h2>Welcome Back!</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={formData.email} onChange={handleChange} required />
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
                  />
                  <button type="button" className="eye-button"
                    onClick={() => setShowPassword(!showPassword)}>
                    👁️
                  </button>
                </div>
              </div>

              <button className="auth-btn">
                {loading ? 'Sending...' : 'Login with OTP'}
              </button>
            </form>

            <p className="auth-link">
              New user? <Link to="/signup">Sign up</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify OTP</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleVerifyOTP}>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                placeholder="Enter OTP"
                required
              />

              <button className="auth-btn">Verify</button>
            </form>

            <button onClick={handleResendOTP} className="resend-btn">
              {resendTimer > 0 ? `Wait ${resendTimer}s` : 'Resend OTP'}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;