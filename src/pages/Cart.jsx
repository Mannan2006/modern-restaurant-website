// src/pages/Cart.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const subtotal = getCartTotal();
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  // Save order to backend before navigating to payment
  const handlePlaceOrder = async () => {
  console.log('🟢 1. Button clicked');
  console.log('🟢 2. Cart items:', cartItems);
  
  if (cartItems.length === 0) return;
  
  setIsPlacingOrder(true);
  
  const orderData = {
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '🍽️'
    })),
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    status: 'pending'
  };
  
  console.log('🟢 3. Order data being sent:', orderData);
  
  try {
  const token = localStorage.getItem('token');

if (!token || token === 'undefined' || token === 'null') {
  alert('Session expired. Please login again.');
  navigate('/login');
  return;
}

console.log('🟢 Token exists ✅');
console.log('🟢 Token preview:', token.substring(0, 50) + '...');
    
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(orderData)
    });
    
    console.log('🟢 6. Response status:', response.status);
    
    const data = await response.json();
    console.log('🟢 7. Response data:', data);
    
    if (response.ok) {
      console.log('✅ Order created! ID:', data.order._id);
      localStorage.setItem('currentOrderId', data.order._id);
      navigate('/payment');
    } else {
      console.error('❌ Order failed:', data);
      alert(`Failed to create order: ${data.message || 'Please try again'}`);
      setIsPlacingOrder(false);
    }
  } catch (err) {
    console.error('❌ Catch error:', err);
    alert('Cannot connect to server. Please make sure backend is running on port 5000');
    setIsPlacingOrder(false);
  }
};
  if (cartItems.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <div className="empty-cart-content">
          <span className="empty-cart-icon">🛒</span>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any items yet</p>
          <button onClick={() => navigate('/menu')} className="browse-menu-btn">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items-section">
          <h2>Cart Items ({cartItems.length})</h2>
          
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              {/* ✅ FIXED: Now showing actual image instead of URL text */}
              <div className="item-image">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => {
                    // Fallback emoji or placeholder image if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '🍽️';
                  }}
                />
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">₹{item.price}</p>
              </div>
              
              <div className="item-quantity">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                ₹{item.price * item.quantity}
              </div>
              
              <button 
                onClick={() => removeFromCart(item.id)}
                className="remove-btn"
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="delivery-address">
            <h3>Delivery Address</h3>
            <p>{user?.address || 'No address provided'}</p>
            <button 
              onClick={() => navigate('/profile')}
              className="edit-address-btn"
            >
              Edit Address
            </button>
          </div>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          
          <button 
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? 'Creating Order...' : 'Proceed to Payment'}
          </button>
          
          <button 
            onClick={() => navigate('/menu')}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;