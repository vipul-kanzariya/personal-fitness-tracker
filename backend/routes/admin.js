const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

// Admin — saare orders dekho
router.get('/orders', authMiddleware, adminMiddleware, async(req, res) => {
  try {
    const orders = await Order.find().populate('items.foodId').populate('userId', 'name email').sort({createdAt: -1});
    res.status(200).json(orders);
  } catch(err) {
    res.status(500).json(err.message);
  }
});
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
router.get('/users', authMiddleware, adminMiddleware, async(req, res) => {
  try {
    const users = await User.find().select('-password'); // password mat bhejo
    res.status(200).json(users);
  } catch(err) {
    res.status(500).json(err.message);
  }
});

// Block/Unblock toggle
router.put('/users/:id/block', authMiddleware, adminMiddleware, async(req, res) => {
  try {
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json('User not found');
    }
    user.isBlocked = !user.isBlocked; // ✅ toggle
    await user.save();
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json(err.message);
  }
});

// Delete user
router.delete('/users/:id', authMiddleware, adminMiddleware, async(req, res) => {
   try {
    const {id} = req.params;
    const users = await User.findByIdAndDelete(id);
    res.status(200).json(users);
  } catch(err) {
    res.status(500).json(err.message);
  }
});
module.exports = router;