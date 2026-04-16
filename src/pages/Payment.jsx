// src/pages/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Payment.css';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const subtotal = getCartTotal();
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  // Get order ID from cart if passed via location state
  useEffect(() => {
    const currentOrderId = localStorage.getItem('currentOrderId');
    if (currentOrderId) {
      setOrderId(currentOrderId);
    }
  }, []);

  // If cart is empty, redirect to menu
  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/menu');
    return null;
  }

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    if (method === 'qr') {
      setShowQR(true);
    } else {
      setShowQR(false);
    }
  };

const handlePlaceOrder = async () => {
  if (!paymentMethod) {
    alert('Please select a payment method');
    return;
  }

  setProcessing(true);

  try {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    // ✅ UPDATE EXISTING ORDER
    if (orderId) {
      const response = await fetch(`https://modern-restaurant-website.onrender.com/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
          status: 'confirmed'
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Order updated:', data);

        setOrderPlaced(true);
        clearCart();
        localStorage.removeItem('currentOrderId');

        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        console.error('❌ Update failed:', data);
        alert(data.message || 'Failed to update order');
      }
    } 
    // ✅ FALLBACK: CREATE NEW ORDER
    else {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '🍽️'
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        status: 'confirmed',
        customer: {
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          address: user?.address
        }
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        setOrderPlaced(true);
        clearCart();

        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        alert(data.message || 'Failed to place order');
      }
    }
  } catch (err) {
    console.error('❌ Error:', err);
    alert('Cannot connect to server');
  } finally {
    setProcessing(false);
  }
};

  if (orderPlaced) {
    return (
      <div className="payment-container">
        <div className="order-success-animation">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for ordering with Foodies</p>
          <div className="order-details-summary">
            <p>Order ID: #{orderId ? orderId.toString().slice(-8) : Date.now().toString().slice(-8)}</p>
            <p>Payment Method: {paymentMethod === 'qr' ? 'QR Code' : paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
            <p>Total Amount: ₹{total}</p>
          </div>
          <div className="loader"></div>
          <p className="redirect-msg">Redirecting to orders page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-wrapper">
        <h1 className="payment-title">Payment Options</h1>
        <p className="payment-subtitle">Choose your preferred payment method</p>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee:</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          
          {/* QR Code Payment */}
          <div 
            className={`payment-method-card ${paymentMethod === 'qr' ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodSelect('qr')}
          >
            <div className="method-icon">📱</div>
            <div className="method-details">
              <h4>QR Code Payment</h4>
              <p>Pay using UPI apps like Google Pay, PhonePe, Paytm</p>
            </div>
            <div className="method-radio">
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'qr'}
                onChange={() => handlePaymentMethodSelect('qr')}
              />
            </div>
          </div>

          {/* Cash on Delivery */}
          <div 
            className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodSelect('cod')}
          >
            <div className="method-icon">💵</div>
            <div className="method-details">
              <h4>Cash on Delivery</h4>
              <p>Pay with cash when your order arrives</p>
            </div>
            <div className="method-radio">
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'cod'}
                onChange={() => handlePaymentMethodSelect('cod')}
              />
            </div>
          </div>

          {/* Credit/Debit Card (Optional) */}
          <div 
            className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodSelect('card')}
          >
            <div className="method-icon">💳</div>
            <div className="method-details">
              <h4>Credit / Debit Card</h4>
              <p>Visa, Mastercard, RuPay accepted</p>
            </div>
            <div className="method-radio">
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'card'}
                onChange={() => handlePaymentMethodSelect('card')}
              />
            </div>
          </div>

          {/* Net Banking */}
          <div 
            className={`payment-method-card ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodSelect('netbanking')}
          >
            <div className="method-icon">🏦</div>
            <div className="method-details">
              <h4>Net Banking</h4>
              <p>All major banks supported</p>
            </div>
            <div className="method-radio">
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'netbanking'}
                onChange={() => handlePaymentMethodSelect('netbanking')}
              />
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {showQR && (
          <div className="qr-section">
            <div className="qr-card">
              <h3>Scan to Pay</h3>
              <div className="qr-code">
                {/* This is a demo QR code - in production, you'd generate a real QR */}
                <div className="qr-placeholder">
                  <div className="qr-grid">
                    {[...Array(25)].map((_, i) => (
                      <div key={i} className={`qr-cell ${Math.random() > 0.5 ? 'dark' : 'light'}`}></div>
                    ))}
                  </div>
                  <div className="qr-center">Foodies</div>
                </div>
              </div>
              <div className="qr-details">
                <p><strong>UPI ID:</strong> foodies@okhdfcbank</p>
                <p><strong>Amount:</strong> ₹{total}</p>
                <p><strong>Order ID:</strong> #{orderId ? orderId.toString().slice(-8) : Date.now().toString().slice(-8)}</p>
              </div>
              <button className="copy-upi-btn" onClick={() => {
                navigator.clipboard.writeText('foodies@okhdfcbank');
                alert('UPI ID copied to clipboard!');
              }}>
                Copy UPI ID
              </button>
            </div>
          </div>
        )}

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <div className="card-payment-form">
            <h3>Card Details</h3>
            <div className="form-group">
              <label>Card Number</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="password" placeholder="123" maxLength="3" />
              </div>
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input type="text" placeholder="Name on card" />
            </div>
          </div>
        )}

        {/* Net Banking Form */}
        {paymentMethod === 'netbanking' && (
          <div className="netbanking-form">
            <h3>Select Your Bank</h3>
            <select className="bank-select">
              <option>Select Bank</option>
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra Bank</option>
              <option>Punjab National Bank</option>
            </select>
          </div>
        )}

        <div className="delivery-address-review">
          <h3>Delivery Address</h3>
          <p><strong>{user?.name}</strong></p>
          <p>{user?.address}</p>
          <p>Phone: {user?.phone}</p>
          <button className="edit-address-btn" onClick={() => navigate('/profile')}>
            Edit Address
          </button>
        </div>

        <button 
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay ₹${total} & Place Order`}
        </button>
      </div>
    </div>
  );
};

export default Payment;