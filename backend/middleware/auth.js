// const jwt = require('jsonwebtoken');

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization').replace('Bearer ', '');
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log("Decoded token:", decoded); // Debugging line

//     // Store the user object inside req.user
//     req.user = { id: decoded.userId };  // Fix here

//     // console.log('Auth middleware called', req.headers.authorization);

//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Authentication required' });
//   }
// };

// module.exports = auth;


const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model for additional checks

const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: Additional user existence check
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Attach user information to the request
    req.user = { 
      id: decoded.userId,
      // You can add more user details if needed
    };

    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.error('Authentication error:', err);
    res.status(401).json({ message: 'Authentication required' });
  }
};

module.exports = auth;
