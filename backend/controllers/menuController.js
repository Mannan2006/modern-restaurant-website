// backend/controllers/menuController.js
const Menu = require('../models/Menu');

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
exports.getMenuItems = async (req, res) => {
  console.log('📋 Fetching all menu items');
  
  try {
    const menuItems = await Menu.find();
    console.log(`✅ Found ${menuItems.length} menu items`);
    
    res.json({
      success: true,
      count: menuItems.length,
      menu: menuItems
    });
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    res.status(500).json({ 
      message: 'Server error while fetching menu', 
      error: error.message 
    });
  }
};

// @route   GET /api/menu/:id
// @desc    Get single menu item by ID
// @access  Public
exports.getMenuItemById = async (req, res) => {
  console.log('📋 Fetching menu item:', req.params.id);
  
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({
      success: true,
      item: menuItem
    });
  } catch (error) {
    console.error('❌ Error fetching menu item:', error);
    res.status(500).json({ 
      message: 'Server error while fetching menu item', 
      error: error.message 
    });
  }
};

// @route   GET /api/menu/category/:category
// @desc    Get menu items by category
// @access  Public
exports.getMenuByCategory = async (req, res) => {
  console.log('📋 Fetching menu by category:', req.params.category);
  
  try {
    const menuItems = await Menu.find({ category: req.params.category });
    console.log(`✅ Found ${menuItems.length} items in ${req.params.category}`);
    
    res.json({
      success: true,
      count: menuItems.length,
      category: req.params.category,
      menu: menuItems
    });
  } catch (error) {
    console.error('❌ Error fetching menu by category:', error);
    res.status(500).json({ 
      message: 'Server error while fetching menu', 
      error: error.message 
    });
  }
};

// @route   POST /api/menu
// @desc    Create a new menu item (Admin only)
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
  console.log('📝 Creating new menu item');
  
  try {
    const { name, price, description, image, category, rating, time, isVeg, discount } = req.body;
    
    const newItem = new Menu({
      name,
      price,
      description,
      image,
      category,
      rating,
      time,
      isVeg,
      discount
    });
    
    await newItem.save();
    console.log('✅ Menu item created:', newItem.name);
    
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item: newItem
    });
  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    res.status(500).json({ 
      message: 'Server error while creating menu item', 
      error: error.message 
    });
  }
};

// @route   PUT /api/menu/:id
// @desc    Update a menu item (Admin only)
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
  console.log('📝 Updating menu item:', req.params.id);
  
  try {
    const updatedItem = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    console.log('✅ Menu item updated:', updatedItem.name);
    res.json({
      success: true,
      message: 'Menu item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    res.status(500).json({ 
      message: 'Server error while updating menu item', 
      error: error.message 
    });
  }
};

// @route   DELETE /api/menu/:id
// @desc    Delete a menu item (Admin only)
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
  console.log('🗑️ Deleting menu item:', req.params.id);
  
  try {
    const deletedItem = await Menu.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    console.log('✅ Menu item deleted:', deletedItem.name);
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    res.status(500).json({ 
      message: 'Server error while deleting menu item', 
      error: error.message 
    });
  }
};