const express = require('express');
const Diet = require('../models/Diet');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',authMiddleware,async(req,res)=>{
    try{
    const {foodName, calories, protein, carbs, fat} = req.body;
    const userId = req.user.id;

    const diet = await Diet.create({
        userId,
        foodName, calories, protein, carbs, fat
    });
    res.status(201).json(diet);
    }catch(err){
        res.status(500).json(err.message);
    }
})
router.get('/',authMiddleware,async(req,res)=>{

   try{
     const diet = await Diet.find({userId:req.user.id}).sort({date:-1});
     res.status(200).json(diet);
   }catch(err){
    res.status(500).json(err.message)
   }
})
router.put('/:id',authMiddleware,async(req,res)=>{

   try{
        const {id} = req.params;
    
     const diet = await Diet.findOneAndUpdate({_id:id,userId:req.user.id},req.body,{new:true});
     if(!diet){
       return res.status(404).json('Diet entry not found');
     }
     res.status(200).json(diet);
   }catch(err){
    res.status(500).json(err.message)
   }

})
router.delete('/:id',authMiddleware,async(req,res)=>{

   try{
        const {id} = req.params;
    
     const diet = await Diet.findOneAndDelete({_id:id,userId:req.user.id});
      if(!diet){
       return res.status(404).json('Diet entry not found');
     }
     res.status(200).json(diet);
   }catch(err){
    res.status(500).json(err.message)
   }

})
module.exports = router