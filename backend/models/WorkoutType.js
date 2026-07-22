const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkoutTypeSchema = Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  caloriesPerMinute: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Cardio', 'Strength', 'Flexibility', 'Balance'],
    default: 'Strength'
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutType', WorkoutTypeSchema);