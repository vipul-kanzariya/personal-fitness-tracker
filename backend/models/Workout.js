const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WorkoutSchema = Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workoutTypeId: {
      type: mongoose.Types.ObjectId,
      ref: "WorkoutType",
      required: true,
    },
    exerciseName: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
    },
    reps: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    caloriesBurned: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Workout", WorkoutSchema);
