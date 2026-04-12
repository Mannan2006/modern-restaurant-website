const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Create user (password will be hashed automatically)
    const newUser = new User({
      name,
      email,
      password,
      phone,
      address
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ✅ LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ FIXED: bcrypt password check
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;