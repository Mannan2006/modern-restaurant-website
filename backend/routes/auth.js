const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ SIGNUP - Fixed response format
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    console.log('📝 Signup attempt for:', email);

    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Create user
    const newUser = new User({
      name,
      email,
      password,
      phone: phone || '',
      address: address || ''
    });

    await newUser.save();
    console.log('✅ User created successfully:', email);

    // Generate token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        address: newUser.address || '',
        role: newUser.role,
        joinedDate: newUser.createdAt
      }
    });

  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error during signup"
    });
  }
});

// ✅ LOGIN - Fixed response format
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please sign up first."
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please try again."
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        joinedDate: user.createdAt
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error during login"
    });
  }
});

// ✅ GET CURRENT USER
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ UPDATE USER PROFILE
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name: name,
        phone: phone || '',
        address: address || ''
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    console.log('✅ Profile updated for:', updatedUser.email);
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error('❌ Update profile error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;