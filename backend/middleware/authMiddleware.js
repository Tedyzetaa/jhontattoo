const { admin } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    // Here you can add additional admin role checks
    // For now, we're just verifying the Firebase token
    // You can extend this to check custom claims if needed
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = { authenticateToken, requireAdmin };