const Order = require('../models/Order');
console.log('🔥 PAYMENT ROUTE HIT:', req.params.id);
exports.createOrder = async (req, res) => {
  console.log('📝 Create order for user:', req.user?.id);
  console.log('📦 Order data:', req.body);
  
  try {
    const { items, subtotal, deliveryFee, total } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No items in order' 
      });
    }
    
    const order = new Order({
      user: req.user.id,
      items: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee || 40,
      total: total,
      status: 'pending'
    });
    
    await order.save();
    console.log('✅ Order saved:', order._id);
    
    res.status(201).json({
      success: true,
      message: 'Order created',
      order: order
    });
  } catch (error) {
    console.error('❌ Order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentMethod, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update only if provided
    if (status) order.status = status;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};