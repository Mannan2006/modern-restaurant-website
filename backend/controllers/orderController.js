const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, deliveryFee, total, paymentMethod } = req.body;
    
    const order = new Order({
      user: req.user.id,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending'
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};