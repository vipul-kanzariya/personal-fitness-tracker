const express = require('express');
const bcryptjs= require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', async(req,res)=>{
  try{
    const {name,email,password} = req.body;
    const checkEmail = await User.findOne({email});
    if(checkEmail){
        return res.status(400).json('Email already exists');
    }
    const hash = await bcryptjs.hash(password,10);
    const user = await User.create({name,email,password:hash});
    
    res.status(201).json(user);
  }catch(error){
    res.status(500).json(error);
  }

});

router.post('/login', async(req,res)=>{
     try{
    const {email,password} = req.body;
    const checkEmail = await User.findOne({email});
    if(!checkEmail){
        return res.status(400).json('Email Not exists');
    }
     if(checkEmail.isBlocked){
        return res.status(403).json('Your account has been blocked. Contact admin.');
    }
    const checkPwd = await bcryptjs.compare(password,checkEmail.password);
    if(!checkPwd){
        return res.status(400).json('Invalid password');

    }
   const token = jsonwebtoken.sign({id: checkEmail._id}, process.env.JWT_SECRET);
return res.status(200).json({ 
  token,
  role: checkEmail.role,
  name: checkEmail.name 
});
  }catch(error){
    res.status(500).json(error);
  }

});
router.get('/profile', authMiddleware, async(req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if(!user){
      return res.status(404).json('User not found');
    }
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json(err.message);
  }
});
router.put('/profile', authMiddleware, async(req, res) => {
  try {
    const { name, age, weight, height } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, age, weight, height },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json(user);
  } catch(err) {
    res.status(500).json(err.message);
  }
});
router.put('/change-password', authMiddleware, async(req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
     const isMatch = await bcryptjs.compare(currentPassword, user.password);
   if(!isMatch) 
     return res.status(400).json('Current password is incorrect');

     const hash = await bcryptjs.hash(newPassword, 10);
    user.password = hash;
     await user.save();
     res.status(200).json('Password updated successfully');
    
  } catch(err) {
    res.status(500).json(err.message);
  }
});

module.exports =router;