const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("name message rating createdAt");
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    const numericRating = Number(rating);

    if (!name || !message || !Number.isFinite(numericRating)) {
      return res.status(400).json("Name, feedback, and rating are required");
    }
    if (numericRating < 0.5 || numericRating > 5 || numericRating * 2 !== Math.round(numericRating * 2)) {
      return res.status(400).json("Rating must be between 0.5 and 5 in half-star increments");
    }

    const feedback = await Feedback.create({
      name: String(name).trim(),
      message: String(message).trim(),
      rating: numericRating,
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
