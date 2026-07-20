const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        foodId: { type: mongoose.Types.ObjectId, ref: "Food" },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Confirmed", "Delivered"],
      default: "Processing",
    },
    paymentId: {
      type: String,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Order", OrderSchema);
