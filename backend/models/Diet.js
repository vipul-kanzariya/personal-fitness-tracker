const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DietSchema = Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number
  },
  carbs: {
    type: Number
  },
  fat: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now,
  }
},{timestamps:true});
module.exports = mongoose.model("Diet", DietSchema);
