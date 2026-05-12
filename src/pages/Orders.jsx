// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update current time every second for real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate order status based on time elapsed since order creation
  const getOrderStatus = (orderDate, currentStatus) => {
    const orderTime = new Date(orderDate);
    const now = new Date(currentTime);
    const elapsedMinutes = Math.floor((now - orderTime) / 60000);
    
    // If order was manually marked as delivered, keep it as delivered
    if (currentStatus === 'delivered' || currentStatus === 'Delivered') {
      return { text: 'Delivered', class: 'status-delivered', step: 5 };
    }
    
    // If order was cancelled
    if (currentStatus === 'cancelled' || currentStatus === 'Cancelled') {
      return { text: 'Cancelled', class: 'status-cancelled', step: 0 };
    }
    
    // Auto-update status based on time
    if (elapsedMinutes >= 25) {
      return { text: 'Delivered', class: 'status-delivered', step: 5 };
    } else if (elapsedMinutes >= 15) {
      return { text: 'Arriving in 10 mins', class: 'status-out-for-delivery', step: 4 };
    } else if (elapsedMinutes >= 10) {
      return { text: 'Out for Delivery', class: 'status-out-for-delivery', step: 3 };
    } else if (elapsedMinutes >= 5) {
      return { text: 'Packed', class: 'status-preparing', step: 2 };
    } else if (elapsedMinutes >= 1) {
      return { text: 'Preparing', class: 'status-preparing', step: 2 };
    } else {
      return { text: 'Confirmed', class: 'status-confirmed', step: 1 };
    }
  };

  // Get delivery time message
  const getDeliveryMessage = (orderDate, currentStatus) => {
    const orderTime = new Date(orderDate);
    const now = new Date(currentTime);
    const elapsedMinutes = Math.floor((now - orderTime) / 60000);
    
    if (currentStatus === 'delivered' || currentStatus === 'Delivered' || elapsedMinutes >= 25) {
      return { text: 'Order Delivered ✓', icon: '✅', color: '#4CAF50' };
    }
    
    if (elapsedMinutes >= 15) {
      const remaining = 25 - elapsedMinutes;
      return { text: `Arriving in ${remaining} minutes`, icon: '🚚', color: '#FF6B35' };
    } else if (elapsedMinutes >= 10) {
      const remaining = 15 - elapsedMinutes;
      return { text: `Out for delivery • ${remaining} mins left`, icon: '🛵', color: '#2196F3' };
    } else if (elapsedMinutes >= 5) {
      const remaining = 10 - elapsedMinutes;
      return { text: `Packed • Ready in ${remaining} mins`, icon: '📦', color: '#FF9800' };
    } else if (elapsedMinutes >= 1) {
      const remaining = 5 - elapsedMinutes;
      return { text: `Preparing • Ready in ${remaining} mins`, icon: '🍳', color: '#FF9800' };
    } else {
      const remaining = 5 - elapsedMinutes;
      return { text: `Confirmed • Preparing in ${remaining} mins`, icon: '✅', color: '#4CAF50' };
    }
  };

  // Get progress step (1-5) for the progress bar
  const getProgressStep = (orderDate, currentStatus) => {
    const orderTime = new Date(orderDate);
    const now = new Date(currentTime);
    const elapsedMinutes = Math.floor((now - orderTime) / 60000);
    
    if (currentStatus === 'delivered' || currentStatus === 'Delivered' || elapsedMinutes >= 25) return 5;
    if (elapsedMinutes >= 15) return 4;
    if (elapsedMinutes >= 10) return 3;
    if (elapsedMinutes >= 5) return 2;
    if (elapsedMinutes >= 1) return 2;
    return 1;
  };

  // Get estimated delivery time
  const getEstimatedDelivery = (orderDate) => {
    const orderTime = new Date(orderDate);
    const estimatedTime = new Date(orderTime.getTime() + 25 * 60000);
    return estimatedTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Toggle order expansion
  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://modern-restaurant-website.onrender.com/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          let ordersArray = [];
          if (Array.isArray(data)) {
            ordersArray = data;
          } else if (data.orders && Array.isArray(data.orders)) {
            ordersArray = data.orders;
          }
          setOrders(ordersArray);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [navigate]);

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-spinner">
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
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-subtitle">Track your food journey 🍕</p>
      </div>
      
      <div className="orders-list">
        {orders.map((order, index) => {
          const orderStatus = getOrderStatus(order.createdAt, order.status);
          const deliveryInfo = getDeliveryMessage(order.createdAt, order.status);
          const progressStep = getProgressStep(order.createdAt, order.status);
          const isDelivered = progressStep === 5;
          
          return (
            <div 
              key={order._id || order.id} 
              className="order-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="order-header" onClick={() => toggleOrder(order._id || order.id)}>
                <div className="order-info">
                  <span className="order-id">
                    Order #{order._id?.slice(-8) || order.id?.slice(-8) || 'N/A'}
                  </span>
                  <span className="order-date">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className={`order-status ${orderStatus.class}`}>
                  {orderStatus.text}
                </div>
              </div>
              
              {/* Delivery Time Tracker */}
              <div style={{ padding: '1rem 1.5rem', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{deliveryInfo.icon}</span>
                  <span style={{ fontWeight: '500', color: '#333' }}>Delivery Status</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {!isDelivered ? (
                      <>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: deliveryInfo.color }}>
                          {getEstimatedDelivery(order.createdAt)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                          {deliveryInfo.text}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4CAF50' }}>
                        Delivered on {formatDate(order.createdAt)}
                      </div>
                    )}
                  </div>
                  {!isDelivered && (
                    <div style={{ 
                      background: '#fff3e0', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      color: '#FF6B35'
                    }}>
                      Live Tracking
                    </div>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: progressStep >= 1 ? '#FF6B35' : '#ccc' }}>✓ Order</span>
                    <span style={{ fontSize: '0.7rem', color: progressStep >= 2 ? '#FF6B35' : '#ccc' }}>🍳 Prep</span>
                    <span style={{ fontSize: '0.7rem', color: progressStep >= 3 ? '#FF6B35' : '#ccc' }}>📦 Packed</span>
                    <span style={{ fontSize: '0.7rem', color: progressStep >= 4 ? '#FF6B35' : '#ccc' }}>🛵 Pickup</span>
                    <span style={{ fontSize: '0.7rem', color: progressStep >= 5 ? '#FF6B35' : '#ccc' }}>🏠 Delivery</span>
                  </div>
                  <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(progressStep / 5) * 100}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #FF6B35, #FF8A5C)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              </div>
              
              {/* Expandable Order Items */}
              {(expandedOrder === (order._id || order.id) || order.items?.length <= 2) && (
                <div className="order-items">
                  <h4>Your Order</h4>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <div className="order-item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="order-footer">
                <div className="order-payment">
                  <span>Payment Method</span>
                  <span className="payment-method">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                     order.paymentMethod === 'qr' ? 'QR / UPI' : 
                     order.paymentMethod || 'Not specified'}
                  </span>
                </div>
                
                <div className="order-delivery">
                  <span>Delivery Address</span>
                  <span className="delivery-address">
                    {order.address || order.customer?.address || 'Address not specified'}
                  </span>
                </div>
                
                <div className="order-total">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{order.total}</span>
                </div>
                
                {order.items?.length > 2 && (
                  <button 
                    className="reorder-btn"
                    onClick={() => toggleOrder(order._id || order.id)}
                    style={{ background: '#f0f2f5', color: '#FF6B35', marginBottom: '0.5rem' }}
                  >
                    {expandedOrder === (order._id || order.id) ? '▲ Hide Items' : '▼ View All Items'}
                  </button>
                )}
                
                <button 
                  className="reorder-btn"
                  onClick={() => navigate('/menu')}
                >
                  Reorder Items
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;