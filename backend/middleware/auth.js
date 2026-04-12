const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');

  console.log('🔐 Auth - Token received:', token ? 'YES' : 'NO');

  // ❗ Fix 1: Better error message
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ❗ Fix 2: attach full decoded safely
    req.user = decoded;   // contains { id: ... }

    console.log('✅ Token verified, user ID:', decoded.id);

    next();
  } catch (err) {
    console.error('❌ Token error:', err.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};