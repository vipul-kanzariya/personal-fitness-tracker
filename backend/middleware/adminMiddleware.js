const { authMiddleware } = require('./authMiddleware');
const User = require('../models/User');

exports.adminMiddleware = async(req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if(user.role !== 'admin'){
      return res.status(403).json('Access denied — Admins only');
    }
    next();
  } catch(err) {
    res.status(500).json(err.message);
  }
}