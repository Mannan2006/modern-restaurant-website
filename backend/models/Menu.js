// backend/models/Menu.js
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  rating: Number,
  time: String,
  isVeg: Boolean,
  discount: Number
});

module.exports = mongoose.model('Menu', menuSchema);