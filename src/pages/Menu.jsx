// pages/Menu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Menu.css';

const menuData = {
  pizza: [
    { id: 1, name: 'Margherita', price: 299, description: 'Classic pizza with tomato sauce, mozzarella, and basil', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop', category: 'pizza', rating: 4.5, time: '15-20 min', isVeg: true, discount: 10 },
    { id: 2, name: 'Pepperoni', price: 399, description: 'Pizza topped with pepperoni and extra cheese', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', category: 'pizza', rating: 4.7, time: '15-20 min', isVeg: false, discount: 15 },
    { id: 3, name: 'BBQ Chicken', price: 449, description: 'Grilled chicken with BBQ sauce and onions', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'pizza', rating: 4.8, time: '20-25 min', isVeg: false },
    { id: 4, name: 'Veggie Supreme', price: 349, description: 'Loaded with fresh vegetables', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', category: 'pizza', rating: 4.4, time: '15-20 min', isVeg: true },
    { id: 5, name: 'Hawaiian', price: 399, description: 'Ham and pineapple', image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=300&fit=crop', category: 'pizza', rating: 4.3, time: '15-20 min', isVeg: false },
    { id: 6, name: 'Mushroom', price: 329, description: 'Fresh mushrooms with herbs', image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&h=300&fit=crop', category: 'pizza', rating: 4.6, time: '15-20 min', isVeg: true },
  ],
  burger: [
    { id: 7, name: 'Classic Burger', price: 199, description: 'Beef patty with lettuce, tomato, and special sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', category: 'burger', rating: 4.5, time: '10-15 min', isVeg: false, discount: 20 },
    { id: 8, name: 'Cheese Burger', price: 249, description: 'Double cheese with crispy bacon', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', category: 'burger', rating: 4.7, time: '10-15 min', isVeg: false },
    { id: 9, name: 'Chicken Burger', price: 229, description: 'Grilled chicken breast with mayo', image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=400&h=300&fit=crop', category: 'burger', rating: 4.6, time: '10-15 min', isVeg: false },
    { id: 10, name: 'Veg Burger', price: 179, description: 'Plant-based patty with fresh veggies', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400&h=300&fit=crop', category: 'burger', rating: 4.4, time: '10-15 min', isVeg: true },
    { id: 11, name: 'Fish Burger', price: 279, description: 'Crispy fish fillet with tartar sauce', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop', category: 'burger', rating: 4.5, time: '12-17 min', isVeg: false },
  ],
  pasta: [
    { id: 12, name: 'Spaghetti Bolognese', price: 249, description: 'Pasta with rich meat sauce', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', category: 'pasta', rating: 4.6, time: '15-20 min', isVeg: false },
    { id: 13, name: 'Fettuccine Alfredo', price: 299, description: 'Creamy pasta with parmesan', image: 'https://images.pexels.com/photos/544961/pexels-photo-544961.jpeg?w=400&h=300&fit=crop', category: 'pasta', rating: 4.7, time: '15-20 min', isVeg: true },
    { id: 14, name: 'Penne Arrabiata', price: 269, description: 'Spicy tomato sauce with garlic', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop', category: 'pasta', rating: 4.5, time: '15-20 min', isVeg: true },
    { id: 15, name: 'Lasagna', price: 349, description: 'Layers of pasta with meat and cheese', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop', category: 'pasta', rating: 4.8, time: '20-25 min', isVeg: false },
    { id: 16, name: 'Mac & Cheese', price: 229, description: 'Creamy cheese sauce with macaroni', image: 'https://images.pexels.com/photos/1279336/pexels-photo-1279336.jpeg?w=400&h=300&fit=crop', category: 'pasta', rating: 4.4, time: '12-17 min', isVeg: true },
  ],
  biriyani: [
    { id: 27, name: 'Chicken Biriyani', price: 249, description: 'Aromatic basmati rice cooked with tender chicken and exotic spices', image: 'https://images.pexels.com/photos/1279337/pexels-photo-1279337.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.8, time: '20-25 min', isVeg: false, discount: 15 },
    { id: 28, name: 'Mutton Biriyani', price: 349, description: 'Slow-cooked mutton with fragrant rice and rich masala', image: 'https://images.pexels.com/photos/6037657/pexels-photo-6037657.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.9, time: '25-30 min', isVeg: false },
    { id: 29, name: 'Veg Biriyani', price: 199, description: 'Fresh vegetables cooked with basmati rice and aromatic spices', image: 'https://images.pexels.com/photos/1279336/pexels-photo-1279336.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.5, time: '15-20 min', isVeg: true },
    { id: 30, name: 'Hyderabadi Biriyani', price: 299, description: 'Famous Hyderabadi dum biriyani with authentic spices', image: 'https://images.pexels.com/photos/10634372/pexels-photo-10634372.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.9, time: '20-25 min', isVeg: false, discount: 10 },
    { id: 31, name: 'Kolkata Biriyani', price: 269, description: 'Light biriyani with potato, egg, and aromatic spices', image: 'https://images.pexels.com/photos/1279338/pexels-photo-1279338.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.7, time: '20-25 min', isVeg: false },
    { id: 32, name: 'Malabar Biriyani', price: 279, description: 'Kerala-style biriyani with khyma rice and roasted spices', image: 'https://images.pexels.com/photos/1279339/pexels-photo-1279339.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.6, time: '20-25 min', isVeg: false },
    { id: 33, name: 'Egg Biriyani', price: 179, description: 'Boiled eggs cooked with flavorful basmati rice', image: 'https://images.pexels.com/photos/1279340/pexels-photo-1279340.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.4, time: '15-20 min', isVeg: false },
    { id: 34, name: 'Prawn Biriyani', price: 399, description: 'Succulent prawns cooked with aromatic rice and spices', image: 'https://images.pexels.com/photos/1279341/pexels-photo-1279341.jpeg?w=400&h=300&fit=crop', category: 'biriyani', rating: 4.8, time: '20-25 min', isVeg: false },
  ],
  salad: [
    { id: 17, name: 'Caesar Salad', price: 179, description: 'Romaine lettuce with Caesar dressing', image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?w=400&h=300&fit=crop', category: 'salad', rating: 4.3, time: '5-10 min', isVeg: true },
    { id: 18, name: 'Greek Salad', price: 199, description: 'Feta cheese, olives, and cucumbers', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', category: 'salad', rating: 4.4, time: '5-10 min', isVeg: true },
    { id: 19, name: 'Garden Salad', price: 149, description: 'Fresh mixed greens', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', category: 'salad', rating: 4.2, time: '5-10 min', isVeg: true },
  ],
  beverages: [
    { id: 20, name: 'Soft Drinks', price: 49, description: 'Coke, Sprite, Fanta', image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop', category: 'beverages', rating: 4.0, time: '2-5 min', isVeg: true },
    { id: 21, name: 'Fresh Lime', price: 39, description: 'Fresh lime soda', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop', category: 'beverages', rating: 4.3, time: '2-5 min', isVeg: true },
    { id: 22, name: 'Milkshake', price: 99, description: 'Chocolate, vanilla, strawberry', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', category: 'beverages', rating: 4.5, time: '5-8 min', isVeg: true },
    { id: 23, name: 'Coffee', price: 79, description: 'Hot brewed coffee', image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop', category: 'beverages', rating: 4.4, time: '3-6 min', isVeg: true },
  ],
  desserts: [
    { id: 24, name: 'Chocolate Cake', price: 129, description: 'Rich chocolate cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', category: 'desserts', rating: 4.6, time: '5-8 min', isVeg: true },
    { id: 25, name: 'Ice Cream', price: 89, description: 'Vanilla, chocolate, strawberry', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', category: 'desserts', rating: 4.5, time: '3-5 min', isVeg: true },
    { id: 26, name: 'Brownie', price: 99, description: 'Warm chocolate brownie', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', category: 'desserts', rating: 4.7, time: '5-8 min', isVeg: true },
  ],
};

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️', color: '#FF6B35' },
    { id: 'pizza', name: 'Pizza', icon: '🍕', color: '#E74C3C' },
    { id: 'burger', name: 'Burgers', icon: '🍔', color: '#F39C12' },
    { id: 'pasta', name: 'Pasta', icon: '🍝', color: '#27AE60' },
    { id: 'biriyani', name: 'Biriyani', icon: '🍛', color: '#FF5722' },
    { id: 'salad', name: 'Salads', icon: '🥗', color: '#2ECC71' },
    { id: 'beverages', name: 'Beverages', icon: '🥤', color: '#3498DB' },
    { id: 'desserts', name: 'Desserts', icon: '🍰', color: '#E91E63' },
  ];

  const getAllItems = () => {
    let allItems = [];
    Object.values(menuData).forEach(category => {
      allItems = [...allItems, ...category];
    });
    return allItems;
  };

  const getFilteredItems = () => {
    let items = selectedCategory === 'all' 
      ? getAllItems() 
      : menuData[selectedCategory] || [];

    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items;
  };

  const updateQuantity = (itemId, delta) => {
    setQuantities(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, Math.min(10, currentQty + delta));
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const quantity = quantities[item.id] || 1;
    if (quantity === 0) return;
    
    // Add item with quantity to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">✅</span>
        <span>${quantity} × ${item.name} added to cart! 🎉</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
    
    // Reset quantity for this item
    setQuantities(prev => {
      const { [item.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) stars.push('★');
    for (let i = fullStars; i < 5; i++) stars.push('☆');
    return stars.join('');
  };

  return (
    <div className="menu-page">
      {/* Hero Section */}
      <div className="hero-banner">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-chip">🍕 Craving something delicious?</span>
            <h1>Explore Our <span className="gradient-text">Menu</span></h1>
            <p>Discover mouthwatering dishes crafted with love and the finest ingredients</p>
          </div>
          
          <div className="search-wrapper">
            <div className="search-box-glow">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search for your favorite dish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-glow"
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-strip">
        <div className="category-container">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="pill-icon">{category.icon}</span>
              <span className="pill-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="menu-grid-container">
        <div className="menu-grid">
          {getFilteredItems().map((item, index) => {
            const quantity = quantities[item.id] || 0;
            return (
              <div 
                key={item.id} 
                className="menu-card-glass"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {item.discount && (
                  <div className="discount-badge">
                    🔥 {item.discount}% OFF
                  </div>
                )}
                
                <div className="card-image-wrapper">
                  <img src={item.image} alt={item.name} className="card-image" />
                  <div className="image-overlay"></div>
                  <div className="veg-badge">
                    {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                  </div>
                  <div className="time-badge">
                    <i className="fas fa-motorcycle"></i> {item.time}
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="item-title">{item.name}</h3>
                    <div className="rating-badge">
                      <span className="stars">{renderStars(item.rating)}</span>
                      <span className="rating-number">{item.rating}</span>
                    </div>
                  </div>
                  
                  <p className="item-desc">{item.description}</p>
                  
                  <div className="card-footer">
                    <div className="price-section">
                      {item.discount ? (
                        <>
                          <span className="original-price">₹{item.price}</span>
                          <span className="discount-price">
                            ₹{Math.floor(item.price * (100 - item.discount) / 100)}
                          </span>
                        </>
                      ) : (
                        <span className="current-price">₹{item.price}</span>
                      )}
                    </div>
                    
                    {quantity > 0 ? (
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className="qty-value">{quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={quantity >= 10}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="add-button"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <i className="fas fa-plus"></i>
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                  
                  {quantity > 0 && (
                    <button 
                      className="confirm-add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add {quantity} to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {getFilteredItems().length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No items found</h3>
          <p>Try searching for something else</p>
          <button onClick={() => setSearchTerm('')} className="reset-btn">
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;