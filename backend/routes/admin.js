const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Inventory = require('../models/Inventory');
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
    const inventoryItems = await Inventory.find();

    const totalStockUnits = inventoryItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const lowStockProducts = inventoryItems.filter((item) => {
      const available = Math.max(0, (Number(item.quantity) || 0) - (Number(item.reservedQuantity) || 0));
      return available > 0 && available <= (Number(item.lowStockThreshold) || 0);
    }).length;
    const outOfStockProducts = inventoryItems.filter((item) => {
      const available = Math.max(0, (Number(item.quantity) || 0) - (Number(item.reservedQuantity) || 0));
      return available <= 0;
    }).length;

    const paidOrders = await Order.find({
      paymentStatus: 'Paid',
      orderStatus: { $ne: 'Cancelled' },
    });
    const totalRevenue = Number(
      paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toFixed(2),
    );

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalFoodItems,
      totalRevenue,
      totalStockUnits,
      lowStockProducts,
      outOfStockProducts,
    });
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
    if(req.params.id === req.user.id){
  return res.status(400).json('You cannot block your own account'); // ✅
}
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
    if(req.params.id === req.user.id){
      return res.status(400).json('You cannot delete your own account'); // ✅
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json('User deleted');
  } catch(err) {
    res.status(500).json(err.message);
  }
});
module.exports = router;