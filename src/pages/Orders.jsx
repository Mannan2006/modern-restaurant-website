// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    console.log('=== ORDERS PAGE DEBUG ===');
    console.log('1. Token exists?', token ? 'YES' : 'NO');
    console.log('2. Token value:', token ? token.substring(0, 30) + '...' : 'null');
    
    console.log('3. Token found - fetching orders');
    
    // Fetch orders
    const fetchOrders = async () => {
      try {
        console.log('4. Making API call to /api/orders');
        
        const response = await fetch('https://modern-restaurant-website.onrender.com/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('5. Response status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
          console.log('6. Token rejected - clearing storage and redirecting');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log('7. Orders data received:', data);
          
          // Extract orders array
          let ordersArray = [];
          if (Array.isArray(data)) {
            ordersArray = data;
          } else if (data.orders && Array.isArray(data.orders)) {
            ordersArray = data.orders;
          }
          
          console.log('8. Orders count:', ordersArray.length);
          setOrders(ordersArray);
        } else {
          console.log('7. Response not OK:', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [navigate]);

  // Don't redirect in render - only show content based on state
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
      <h1 className="orders-title">My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id || order.id} className="order-card">
            <div className="order-header">
              <span>Order #{order._id?.slice(-8) || order.id?.slice(-8)}</span>
              <span className="order-status">{order.status || 'Confirmed'}</span>
            </div>
            <div className="order-body">
              <p>Total: ₹{order.total}</p>
              <p>Items: {order.items?.length || 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;