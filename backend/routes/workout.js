const express = require('express');
const Workout = require('../models/Workout');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',authMiddleware,async(req,res)=>{
    try{
    const {exerciseName, sets, reps, duration, caloriesBurned} = req.body;
    const userId = req.user.id;

    const workout = await Workout.create({
        userId,
        exerciseName,
        sets,
        reps,
        duration,
        caloriesBurned
    });
    res.status(201).json(workout);
    }catch(err){
        res.status(500).json(err.message);
    }


})
router.get('/',authMiddleware,async(req,res)=>{

   try{
     const workout = await Workout.find({userId:req.user.id}).sort({date:-1});
     res.status(200).json(workout);
   }catch(err){
    res.status(500).json(err.message)
   }

})
router.put('/:id', authMiddleware, async(req, res) => {
  try{
    const {id} = req.params;
    const {exerciseName} = req.body;

    
    if(exerciseName !== undefined && !exerciseName.trim()){
      return res.status(400).json('Exercise name cannot be empty');
    }

    const workout = await Workout.findOneAndUpdate(
      {_id: id, userId: req.user.id},
      req.body,
      {new: true, runValidators: true}
    );
    if(!workout){
      return res.status(404).json('Workout not found');
    }
    res.status(200).json(workout);
  }catch(err){
    res.status(500).json(err.message);
  }
});
router.delete('/:id',authMiddleware,async(req,res)=>{

   try{
        const {id} = req.params;
    
     const workout = await Workout.findOneAndDelete({_id:id,userId:req.user.id});
      if(!workout){
      return res.status(404).json('Workout not found'); 
      }
     res.status(200).json(workout);
   }catch(err){
    res.status(500).json(err.message)
   }

})
module.exports = router