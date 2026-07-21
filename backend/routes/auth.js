const express = require('express');
const bcryptjs= require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User');

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
    const checkPwd = await bcryptjs.compare(password,checkEmail.password);
    if(!checkPwd){
        return res.status(400).json('Invalid password');

    }
   const token = jsonwebtoken.sign({id: checkEmail._id}, process.env.JWT_SECRET);
return res.status(200).json({ 
  token,
  role: checkEmail.role 
});
  }catch(error){
    res.status(500).json(error);
  }

});

module.exports =router;