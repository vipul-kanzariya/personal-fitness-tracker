const express = require("express");
const Bmi = require("../models/BMI");
const { authMiddleware } = require("../middleware/authMiddleware");
const WorkoutType = require("../models/WorkoutType");
const router = express.Router();

router.post("/calculate", authMiddleware, async (req, res) => {
  try {
    const { weight, height } = req.body;
    const numericWeight = Number(weight);
    const numericHeight = Number(height);
    if (!Number.isFinite(numericWeight) || numericWeight <= 0 ||
        !Number.isFinite(numericHeight) || numericHeight <= 0) {
      return res.status(400).json({ message: "Weight and height must be positive numbers" });
    }
    const bmi = (numericWeight / (numericHeight * numericHeight)).toFixed(2);
    let category;
    if (bmi < 18.5) {
      category = "Underweight";
    } else if (bmi < 25) {
      category = "Normal";
    } else if (bmi < 30) {
      category = "Overweight";
    } else {
      category = "Obese";
    }
    const bmiRecord = await Bmi.create({
      userId: req.user.id,
      weight: numericWeight,
      height: numericHeight,
      bmi,
      category,
    });
     let filterCategory;
    if (category === 'Underweight') {
      filterCategory = ['Strength'];
    } else if (category === 'Normal') {
      filterCategory = ['Cardio', 'Strength'];
    } else {
      filterCategory = ['Cardio'];  
    }
     const suggestedWorkouts = await WorkoutType.find({
      category: { $in: filterCategory }
    }).limit(4);

    return res.status(201).json({
      ...bmiRecord.toObject(),
      suggestedWorkouts   
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get('/history',authMiddleware,async(req,res)=>{

   try{
     const { from, to } = req.query;
     const filter = { userId: req.user.id, isDeleted: false };
     if (from || to) {
       filter.createdAt = {};
       if (from) filter.createdAt.$gte = new Date(from);
       if (to) {
         const toDate = new Date(to);
         toDate.setHours(23, 59, 59, 999);
         filter.createdAt.$lte = toDate;
       }
     }
     const bmi = await Bmi.find(filter).sort({createdAt:-1});
     res.status(200).json(bmi);
   }catch(err){
    res.status(500).json(err.message)
   }
})

module.exports = router
