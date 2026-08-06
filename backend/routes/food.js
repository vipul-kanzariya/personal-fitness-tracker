const express = require('express');
const Food = require('../models/Food');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const multer = require('multer');
const { cloudinary } = require('../utils/cloudinary');
const upload = multer({ storage: multer.memoryStorage() });
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
router.post('/upload-image', authMiddleware, adminMiddleware, upload.single('image'), async(req, res) => {
  try {
    
    if(!req.file){
      return res.status(400).json('No image provided');
    }
    // Buffer ko base64 mein convert karke Cloudinary pe upload karo
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'fitness-tracker-food'
    });
    res.status(200).json({ imageUrl: result.secure_url });
  } catch(err) {
     

    res.status(500).json('Failed to upload image');
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