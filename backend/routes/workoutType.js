const express = require('express');
const WorkoutType = require('../models/WorkoutType');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async(req, res) => {
  try{
    const types = await WorkoutType.find();
    res.status(200).json(types);
  }catch(err){
     res.status(500).json(err.message);
  }
});


router.post('/', authMiddleware, adminMiddleware, async(req, res) => {
 try{
 const {name, caloriesPerMinute, category} = req.body;
const type = await WorkoutType.create({name, caloriesPerMinute, category});
res.status(201).json(type);
  }catch(err){
     res.status(500).json(err.message);
  }
});


router.put('/:id', authMiddleware, adminMiddleware, async(req, res) => {
  try{
    const {id} = req.params;
const type = await WorkoutType.findByIdAndUpdate(id, req.body, {new: true});
res.status(200).json(type);
  }catch(err){
    res.status(500).json(err.message);
  }
});


router.delete('/:id', authMiddleware, adminMiddleware, async(req, res) => {
  try{
const {id} = req.params;
const type = await WorkoutType.findByIdAndDelete(id);
res.status(200).json(type);
  }catch(err){
    res.status(500).json(err.message);

  }
});

module.exports = router;