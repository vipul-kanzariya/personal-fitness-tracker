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
    res.status(500).json({ message: 'Nutrition estimation is currently unavailable. Please enter values manually.' });
  }
});
router.get('/',authMiddleware,async(req,res)=>{

   try{
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
     const diet = await Diet.find(filter).sort({date:-1});
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
          {returnDocument: 'after', runValidators: true}
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
     {returnDocument: 'after'});
      if(!diet){
       return res.status(404).json('Diet entry not found');
     }
     res.status(200).json(diet);
   }catch(err){
    res.status(500).json(err.message)
   }

})
module.exports = router