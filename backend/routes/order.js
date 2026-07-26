const express = require("express");
const Order = require("../models/Order");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require('../middleware/adminMiddleware');
const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.id;
    const order = await Order.create({ userId, items, totalAmount });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/", authMiddleware, async (req, res) => {
  try {
    const food = await Order.find({userId:req.user.id}).populate('items.foodId').sort({createdAt:-1});
    res.status(200).json(food);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const {id}= req.params;
    const food = await Order.findById(id).populate('items.foodId');
    res.status(200).json(food);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ sirf apna order dhundo
    const order = await Order.findOne({ _id: id, userId: req.user.id });
    if (!order) {
      return res.status(404).json('Order not found');
    }

    // ✅ Delivered order cancel nahi ho sakta
    if (order.orderStatus === 'Delivered') {
      return res.status(400).json('Delivered orders cannot be cancelled');
    }
    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json('Order is already cancelled');
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.put("/:id/status", authMiddleware,adminMiddleware, async (req, res) => {
  try {
    const {orderStatus}= req.body
    const {id}= req.params;
    const food = await Order.findByIdAndUpdate(id,{orderStatus},{new:true});
    res.status(200).json(food);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
