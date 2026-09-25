const express = require('express');
const bcryptjs= require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/register', async(req,res)=>{
  try{
    const {name,password} = req.body;
    const email = normalizeEmail(req.body.email);
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json('Please enter a valid email address');
    }
    const checkEmail = await User.findOne({email});
    if(checkEmail){
        return res.status(400).json('Email already exists');
    }
    const hash = await bcryptjs.hash(password,10);
    const user = await User.create({name,email,password:hash});
    const userResponse = await User.findById(user._id).select('-password');
    res.status(201).json(userResponse);
  }catch(error){
    res.status(500).json(error);
  }

});

router.post('/login', async(req,res)=>{
     try{
    const {password} = req.body;
    const email = normalizeEmail(req.body.email);
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json('Please enter a valid email address');
    }
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
   const token = jsonwebtoken.sign({id: checkEmail._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
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

router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json('Please enter a valid email address');
    }
    const user = await User.findOne({ email });

    // Security: same generic response chahiye chahe email exist kare ya na kare
    if (!user) {
      return res.status(200).json('If that email exists, a reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset — FitTrack',
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password (valid for 1 hour):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    res.status(200).json('If that email exists, a reset link has been sent.');
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json('Reset link is invalid or has expired.');
    }

    const hash = await bcryptjs.hash(newPassword, 10);
    user.password = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json('Password reset successfully. You can now log in.');
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports =router;