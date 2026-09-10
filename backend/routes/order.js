const express = require("express");
const Order = require("../models/Order");
const Food = require("../models/Food");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require('../middleware/adminMiddleware');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("At least one food item is required");
    error.statusCode = 400;
    throw error;
  }

  let totalAmount = 0;
  const validatedItems = await Promise.all(items.map(async (item) => {
    const food = await Food.findById(item.foodId);
    if (!food || !food.inStock) {
      const error = new Error(`Food item unavailable: ${item.foodId}`);
      error.statusCode = 400;
      throw error;
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      const error = new Error("Item quantity must be a positive whole number");
      error.statusCode = 400;
      throw error;
    }

    totalAmount += food.price * quantity;
    return {
      foodId: food._id,
      name: food.name,
      price: food.price,
      quantity,
    };
  }));

  return {
    items: validatedItems,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

router.post("/payment/order", authMiddleware, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json("Razorpay is not configured");
    }

    const validatedOrder = await validateOrderItems(req.body.items);
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(validatedOrder.totalAmount * 100),
      currency: "INR",
      receipt: `fittrack_${Date.now()}`,
      notes: { userId: req.user.id },
    });

    const order = await Order.create({
      userId: req.user.id,
      ...validatedOrder,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
  }
});

router.post("/payment/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json("Payment verification details are required");
    }

    const order = await Order.findOne({
      _id: req.body.orderId,
      userId: req.user.id,
      razorpayOrderId,
    });
    if (!order) {
      return res.status(404).json("Order not found");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedSignatureBuffer = Buffer.from(razorpaySignature, "utf8");
    if (
      expectedSignatureBuffer.length !== receivedSignatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer)
    ) {
      order.paymentStatus = "Failed";
      await order.save();
      return res.status(400).json("Invalid payment signature");
    }

    order.paymentStatus = "Paid";
    order.paymentId = razorpayPaymentId;
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const validatedOrder = await validateOrderItems(req.body.items);
    const userId = req.user.id;
    const order = await Order.create({ userId, ...validatedOrder });
    res.status(201).json(order);
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
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
    const order = await Order.findOne({
  _id: req.params.id,
  userId: req.user.id  // ✅ ownership check
}).populate('items.foodId');
if(!order) return res.status(404).json('Order not found');
    res.status(200).json(order);
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
