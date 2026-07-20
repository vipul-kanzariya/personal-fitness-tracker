const express = require("express");
const Bmi = require("../models/BMI");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/calculate", authMiddleware, async (req, res) => {
  try {
    const { weight, height } = req.body;
    const bmi = (weight / (height * height)).toFixed(2);
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
      weight,
      height,
      bmi,
      category,
    });
    return res.status(201).json(bmiRecord);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get('/history',authMiddleware,async(req,res)=>{

   try{
     const bmi = await Bmi.find({userId:req.user.id}).sort({date:-1});
     res.status(200).json(bmi);
   }catch(err){
    res.status(500).json(err.message)
   }
})

module.exports = router
