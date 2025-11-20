const { admin, db } = require('../config/firebase');

// Verify Firebase token and get user data
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token is required' 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get additional user data from Firestore if needed
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || userData.name,
        picture: decodedToken.picture || userData.picture,
        role: userData.role || 'user'
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Check if user is admin
const checkAdminStatus = async (req, res) => {
  try {
    // This endpoint is protected by auth middleware
    // so req.user is already available
    res.json({
      success: true,
      isAdmin: true,
      user: req.user
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Admin check failed' 
    });
  }
};

module.exports = {
  verifyToken,
  checkAdminStatus
};