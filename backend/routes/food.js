const express = require('express');
const Food = require('../models/Food');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/',async(req,res)=>{
    try{
        const food = await Food.find({inStock:true});
        res.status(200).json(food);
    }catch(err){
         res.status(500).json(err.message);
    }
    
});
router.get('/:id',async(req,res)=>{
    try{
        const {id} = req.params;
        const food = await Food.findById(id);
        res.status(200).json(food);
    }catch(err){
         res.status(500).json(err.message);
    }
    
});
router.post('/',authMiddleware,adminMiddleware,async(req,res)=>{
    try{
        const {name, description, price, calories, protein, carbs, fat, category, image} = req.body;
        const food = await Food.create({name, description, price, calories, protein, carbs, fat, category, image});
        res.status(201).json(food);
    }catch(err){
         res.status(500).json(err.message);
    }
});
router.put('/:id',authMiddleware,adminMiddleware,async(req,res)=>{
    try{
        const {id} = req.params;
        const food = await Food.findByIdAndUpdate(id,req.body,{new:true});
        res.status(200).json(food);
    }catch(err){
         res.status(500).json(err.message);
    }
});
router.delete('/:id',authMiddleware,adminMiddleware,async(req,res)=>{
    try{
        const {id} = req.params;
        const food = await Food.findByIdAndDelete(id);
        res.status(200).json(food);
    }catch(err){
         res.status(500).json(err.message);
    }
});

module.exports = router