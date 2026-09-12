const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    rating: {
      type: Number,
      required: true,
      min: 0.5,
      max: 5,
      validate: {
        validator: (value) => value * 2 === Math.round(value * 2),
        message: "Rating must be in half-star increments",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
