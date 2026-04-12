// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// DNS fix (if needed)
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // ADD THIS: Log which database we're connected to
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📀 Database name: ${dbName}`);
    
    // ADD THIS: List all collections in the database
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('📁 Collections in database:');
        collections.forEach(col => console.log(`   - ${col.name}`));
      })
      .catch(err => console.error('Error listing collections:', err));
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ADD THIS: Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/menu', require('./routes/menu')); // Add menu routes

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ADD THIS: Test route to check users in database
app.get('/api/check-users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({}).select('-password');
    res.json({
      message: 'Users in database',
      count: users.length,
      users: users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD THIS: Test route to check database connection info
app.get('/api/db-info', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    res.json({
      connected: mongoose.connection.readyState === 1,
      databaseName: db.databaseName,
      collections: collectionNames
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
  console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📍 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`📍 Menu API: http://localhost:${PORT}/api/menu`);
  console.log(`📍 Check Users: http://localhost:${PORT}/api/check-users`);
  console.log(`📍 DB Info: http://localhost:${PORT}/api/db-info`);
});