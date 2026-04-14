const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

router.use(auth);

// ✅ CREATE ORDER
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      user: req.user.id
    });

    const savedOrder = await newOrder.save();

    console.log('✅ Order saved:', savedOrder._id);

    res.status(201).json({
      success: true,
      order: savedOrder
    });
  } catch (err) {
    console.error('❌ Create order error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ GET USER ORDERS
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('❌ Fetch orders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ GET ORDER BY ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error('❌ Get order error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ UPDATE ORDER (THIS FIXES YOUR PAYMENT ERROR)
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('✅ Order updated:', updatedOrder._id);

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (err) {
    console.error('❌ Update order error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;