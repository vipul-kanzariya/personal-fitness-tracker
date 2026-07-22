const express = require('express');
const Workout = require('../models/Workout');
const { authMiddleware } = require('../middleware/authMiddleware');
const WorkoutType = require('../models/WorkoutType');
const router = express.Router();

router.post('/',authMiddleware,async(req,res)=>{
     try {
    const {workoutTypeId, sets, reps, duration} = req.body;
    const userId = req.user.id;

  
    const workoutType = await WorkoutType.findById(workoutTypeId);
    if(!workoutType){
      return res.status(404).json('Workout type not found');
    }

  
    const caloriesBurned =Number((workoutType.caloriesPerMinute * duration * (1 + (sets * reps) / 1000)).toFixed(2));

    const workout = await Workout.create({
      userId,
      workoutTypeId,
      exerciseName: workoutType.name, 
      sets, reps, duration,
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
    const {exerciseName, sets, reps, duration} = req.body;

    if(exerciseName !== undefined && !exerciseName.trim()){
      return res.status(400).json('Exercise name cannot be empty');
    }

    // ✅ pehle purana workout dhundo — workoutTypeId chahiye
    const existingWorkout = await Workout.findOne({_id: id, userId: req.user.id});
    if(!existingWorkout){
      return res.status(404).json('Workout not found');
    }

    // ✅ workout type se caloriesPerMinute lo
    const workoutType = await WorkoutType.findById(existingWorkout.workoutTypeId);

    // ✅ duration/sets/reps naya hai to use karo, warna purana
    const newDuration = duration !== undefined ? duration : existingWorkout.duration;
    const newSets = sets !== undefined ? sets : existingWorkout.sets;
    const newReps = reps !== undefined ? reps : existingWorkout.reps;

    const caloriesBurned = Number(
      (workoutType.caloriesPerMinute * newDuration * (1 + (newSets * newReps) / 1000)).toFixed(2)
    );

    const workout = await Workout.findOneAndUpdate(
      {_id: id, userId: req.user.id},
      { sets: newSets, reps: newReps, duration: newDuration, caloriesBurned },
      {new: true, runValidators: true}
    );
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