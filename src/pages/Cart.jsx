// src/pages/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const subtotal = getCartTotal();
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    // Navigate to payment page
    navigate('/payment');
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
              <div className="item-image">
                {item.image || '🍽️'}
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
          >
            Proceed to Payment
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