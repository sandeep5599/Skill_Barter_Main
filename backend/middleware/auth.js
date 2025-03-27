const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded); // Debugging line

    // Store the user object inside req.user
    req.user = { id: decoded.userId };  // Fix here

    // console.log('Auth middleware called', req.headers.authorization);

    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

module.exports = auth;
