const express = require('express');
const Diet = require('../models/Diet');
const { authMiddleware } = require('../middleware/authMiddleware');
const { askAI } = require('../utils/aiHelper');
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
router.post('/estimate', authMiddleware, async(req, res) => {
  try {
    const { foodName } = req.body;

    if (!foodName || !foodName.trim()) {
      return res.status(400).json('Food name is required');
    }

    const prompt = `Estimate nutrition values for this food: "${foodName}". 
Reply ONLY with valid JSON, no explanation, no markdown, in this exact format:
{"calories": number, "protein": number, "carbs": number, "fat": number}`;

    const aiText = await askAI(prompt);

  const cleanText = aiText.replace(/```json|```/g, '').trim();
const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
const nutrition = JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);

    res.status(200).json(nutrition);
  } catch(err) {
     console.log('AI ERROR:', err.message);
    res.status(500).json('Failed to estimate nutrition. Please enter values manually.');
  }
});
router.get('/',authMiddleware,async(req,res)=>{

   try{
     const diet = await Diet.find({userId:req.user.id, isDeleted: false}).sort({date:-1});
     res.status(200).json(diet);
   }catch(err){
    res.status(500).json(err.message)
   }
})
router.put('/:id',authMiddleware,async(req,res)=>{

   try{
        const {id} = req.params;
        const {foodName, calories} = req.body;
     if(foodName !== undefined && !foodName.trim()){
          return res.status(400).json('Food name cannot be empty');
        }
        if(calories !== undefined && calories <= 0){
          return res.status(400).json('Calories must be greater than 0');
        }
    const diet = await Diet.findOneAndUpdate(
          {_id:id,userId:req.user.id},
          req.body,
          {new:true, runValidators: true}
        );
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
    
     const diet = await Diet.findOneAndUpdate({_id:id, userId:req.user.id},
     {isDeleted: true},
     {new: true});
      if(!diet){
       return res.status(404).json('Diet entry not found');
     }
     res.status(200).json(diet);
   }catch(err){
    res.status(500).json(err.message)
   }

})
module.exports = router