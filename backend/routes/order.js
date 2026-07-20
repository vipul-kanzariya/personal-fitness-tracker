const express = require("express");
const Order = require("../models/Order");
const { authMiddleware } = require("../middleware/authMiddleware");

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
router.put("/:id/status", authMiddleware, async (req, res) => {
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
