// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch orders from backend API
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://modern-restaurant-website.onrender.com/api/orders', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform backend orders to match existing format
          const formattedOrders = data.map(order => ({
            id: order._id,
            items: order.items,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            total: order.total,
            paymentMethod: order.paymentMethod,
            status: order.status || 'Confirmed',
            date: order.createdAt,
            customer: {
              address: user?.address || 'Address not specified'
            }
          }));
          setOrders(formattedOrders);
        } else if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        // Fallback to localStorage if backend is not available
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(savedOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate, user?.address]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#4caf50';
      case 'Preparing': return '#ff9800';
      case 'Out for Delivery': return '#2196f3';
      case 'Delivered': return '#9c27b0';
      case 'pending': return '#ff9800';
      case 'confirmed': return '#4caf50';
      case 'cancelled': return '#f44336';
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date not available';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="orders-container empty-orders">
        <div className="empty-orders-content">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
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
                  {formatDate(order.date)}
                </span>
              </div>
              <div 
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status === 'pending' ? 'Confirmed' : 
                 order.status === 'confirmed' ? 'Confirmed' : 
                 order.status === 'cancelled' ? 'Cancelled' : 
                 order.status || 'Confirmed'}
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
                <span className="delivery-address">{order.customer?.address || user?.address || 'Address not specified'}</span>
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