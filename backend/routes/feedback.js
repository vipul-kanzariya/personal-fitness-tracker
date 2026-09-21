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
    console.error("Unable to load community feedback:", err);
    res.status(500).json({ message: "Unable to load community feedback." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    const numericRating = Number(rating);
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!trimmedName || !trimmedMessage || !Number.isFinite(numericRating)) {
      return res.status(400).json("Name, feedback, and rating are required");
    }
    if (trimmedName.length > 100 || trimmedMessage.length > 1000) {
      return res.status(400).json({ message: "Name or feedback is too long" });
    }
    if (numericRating < 0.5 || numericRating > 5 || numericRating * 2 !== Math.round(numericRating * 2)) {
      return res.status(400).json("Rating must be between 0.5 and 5 in half-star increments");
    }

    const feedback = await Feedback.create({
      name: trimmedName,
      message: trimmedMessage,
      rating: numericRating,
    });
    res.status(201).json(feedback);
  } catch (err) {
    console.error("Unable to save community feedback:", err);
    res.status(500).json({ message: "Unable to save community feedback." });
  }
});

module.exports = router;
