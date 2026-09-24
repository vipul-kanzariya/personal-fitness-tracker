const express = require("express");
const Workout = require("../models/Workout");
const { authMiddleware } = require("../middleware/authMiddleware");
const WorkoutType = require("../models/WorkoutType");
const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { workoutTypeId, sets, reps, duration } = req.body;
    const userId = req.user.id;

    const workoutType = await WorkoutType.findById(workoutTypeId);
    if (!workoutType) {
      return res.status(404).json("Workout type not found");
    }

    let caloriesBurned = 0;
    if(workoutType.trackingType === 'duration_only'){
      caloriesBurned = Number((workoutType.caloriesPerMinute * (duration || 0)).toFixed(2));
    } else if(workoutType.trackingType === 'sets_reps'){
      caloriesBurned = Number((workoutType.caloriesPerMinute * ((sets || 0) * (reps || 0) * 0.5)).toFixed(2));
    } else {
      caloriesBurned = Number((workoutType.caloriesPerMinute * (duration || 0) * (1 + ((sets || 0) * (reps || 0)) / 1000)).toFixed(2));
    }

    // ✅ yeh missing tha!
    const workout = await Workout.create({
      userId, workoutTypeId,
      exerciseName: workoutType.name,
      sets: sets || 0, reps: reps || 0,
      duration: duration || 0, caloriesBurned,
    });
    await workout.populate("workoutTypeId", "name category caloriesPerMinute trackingType");
    res.status(201).json(workout);

  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/", authMiddleware, async (req, res) => {
  try {
   const { from, to } = req.query;
     const filter = { userId: req.user.id, isDeleted: false };
     if (from || to) {
       filter.date = {};
       if (from) filter.date.$gte = new Date(from);
       if (to) {
         const toDate = new Date(to);
         toDate.setHours(23, 59, 59, 999);
         filter.date.$lte = toDate;
       }
     }
     const workout = await Workout.find(filter)
       .populate('workoutTypeId', 'name category caloriesPerMinute')
       .sort({ date: -1 });
     res.status(200).json(workout);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { workoutTypeId, sets, reps, duration } = req.body;

    // ✅ pehle purana workout dhundo — workoutTypeId chahiye
    const existingWorkout = await Workout.findOne({
      _id: id,
      userId: req.user.id,
    });
    if (!existingWorkout) {
      return res.status(404).json("Workout not found");
    }

    // ✅ workout type se caloriesPerMinute lo
    const newWorkoutTypeId = workoutTypeId || existingWorkout.workoutTypeId;
    const workoutType = await WorkoutType.findById(newWorkoutTypeId);

    // ✅ duration/sets/reps naya hai to use karo, warna purana
    const newDuration =
      duration !== undefined ? duration : existingWorkout.duration;
    const newSets = sets !== undefined ? sets : existingWorkout.sets;
    const newReps = reps !== undefined ? reps : existingWorkout.reps;

  let caloriesBurned = 0;
if(workoutType.trackingType === 'duration_only'){
  caloriesBurned = Number((workoutType.caloriesPerMinute * newDuration).toFixed(2));
} else if(workoutType.trackingType === 'sets_reps'){
  caloriesBurned = Number((workoutType.caloriesPerMinute * (newSets * newReps * 0.5)).toFixed(2));
} else {
  caloriesBurned = Number((workoutType.caloriesPerMinute * newDuration * (1 + (newSets * newReps) / 1000)).toFixed(2));
}

    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        workoutTypeId: newWorkoutTypeId,
        sets: newSets,
        reps: newReps,
        duration: newDuration,
        caloriesBurned,
      },
      { returnDocument: 'after', runValidators: true },
    ).populate("workoutTypeId", "name category caloriesPerMinute");
    res.status(200).json(workout);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const workout = await Workout.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isDeleted: true },
      { returnDocument: 'after' },
    );
    if (!workout) {
      return res.status(404).json("Workout not found");
    }
    res.status(200).json(workout);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
module.exports = router;
