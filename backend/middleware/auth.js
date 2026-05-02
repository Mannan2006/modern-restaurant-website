const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  let token = null;

  // ✅ Support BOTH formats
  // 1. Authorization: Bearer token
  // 2. x-auth-token (your old method)

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }

  console.log('🔐 Auth - Token received:', token ? 'YES' : 'NO');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    console.log('✅ Token verified, user ID:', decoded.id);

    next();
  } catch (err) {
    console.error('❌ Token error:', err.message);

    // ⚠️ IMPORTANT: return 403 (not 401)
    // so frontend knows it should refresh token
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};