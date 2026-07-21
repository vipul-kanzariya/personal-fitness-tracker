const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/summary', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalFoodItems = await Food.countDocuments();

    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.status(200).json({ totalUsers, totalOrders, totalFoodItems, totalRevenue });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;