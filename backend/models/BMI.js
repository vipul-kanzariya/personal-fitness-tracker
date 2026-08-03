const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BmiSchema = Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    bmi: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["Underweight", "Normal", "Overweight", "Obese"],
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Bmi", BmiSchema);
