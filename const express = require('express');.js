const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = require('../config/mailer');

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    // Create user
    const user = new User({
      email: req.body.email,
      password: req.body.password,
      isConfirmed: false
    });
    
    // Generate confirmation token
    const confirmToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send confirmation email
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm/${confirmToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Confirm Your Email',
      html: `Please click <a href="${confirmUrl}">here</a> to confirm your email`
    });

    await user.save();
    res.status(201).json({ message: 'Please check your email to confirm account' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET api/auth/confirm/:token
// @desc    Confirm user email
// @access  Public
router.get('/confirm/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { isConfirmed: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.redirect('/login');
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;