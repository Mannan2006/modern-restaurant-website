// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, [isAuthenticated, navigate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#4caf50';
      case 'Preparing': return '#ff9800';
      case 'Out for Delivery': return '#2196f3';
      case 'Delivered': return '#9c27b0';
      default: return '#666';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    switch(method) {
      case 'qr': return 'QR Code / UPI';
      case 'cod': return 'Cash on Delivery';
      case 'card': return 'Credit/Debit Card';
      case 'netbanking': return 'Net Banking';
      default: return method || 'Not specified';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container empty-orders">
        <div className="empty-orders-content">
          <span className="empty-orders-icon">📦</span>
          <h2>No Orders Yet</h2>
          <p>Hungry? Order some delicious food from our menu!</p>
          <button onClick={() => navigate('/menu')} className="browse-menu-btn">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1 className="orders-title">My Orders</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-id">Order #{order.id.toString().slice(-8)}</span>
                <span className="order-date">
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div 
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status}
              </div>
            </div>
            
            <div className="order-items">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="order-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="order-footer">
              <div className="order-payment">
                <span>Payment Method:</span>
                <span className="payment-method">{getPaymentMethodDisplay(order.paymentMethod)}</span>
              </div>
              
              <div className="order-delivery">
                <span>Delivery Address:</span>
                <span className="delivery-address">{order.customer?.address || 'Address not specified'}</span>
              </div>
              
              <div className="order-total">
                <span>Total Amount:</span>
                <span className="total-amount">₹{order.total}</span>
              </div>
              
              <button 
                className="reorder-btn"
                onClick={() => navigate('/menu')}
              >
                Reorder Items
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;