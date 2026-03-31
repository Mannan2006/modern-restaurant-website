// pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOrderNow = () => {
    navigate('/menu');
  };

  return (
    <div className="home-premium">
      {/* Hero Section - Enhanced Premium Version */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">✨ Premium Food Delivery</div>
            <h1>Delicious Food <span className="highlight">Delivered</span> Fast</h1>
            <p>Order your favorite meals anytime, anywhere. Fresh, hot, and delivered right to your doorstep.</p>
            <div className="hero-buttons">
              <Link to="/menu" className="order-now-btn">Order Now →</Link>
              {!user && (
                <Link to="/signup" className="signup-btn-hero">Sign Up Free</Link>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Restaurants</span>
              </div>
              <div className="stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat">
                <span className="stat-number">30min</span>
                <span className="stat-label">Avg Delivery</span>
              </div>
            </div>
          </div>
          <div className="hero-image-premium">
            <div className="hero-food-image">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop" 
                alt="Delicious Food" 
                className="hero-main-img"
              />
            </div>
            <div className="floating-card card-1">
              <span className="food-icon">🍕</span>
              <span>Pizza</span>
            </div>
            <div className="floating-card card-2">
              <span className="food-icon">🍔</span>
              <span>Burger</span>
            </div>
            <div className="floating-card card-3">
              <span className="food-icon">🍛</span>
              <span>Biriyani</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - New */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2>Experience the Best Food Delivery</h2>
            <p>We make sure you get the best experience from ordering to delivery</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Delivery</h3>
              <p>Get your food delivered within 30 minutes, piping hot and fresh</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍳</div>
              <h3>Quality Food</h3>
              <p>Prepared with the finest ingredients from trusted suppliers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Easy Payment</h3>
              <p>Multiple payment options including UPI, Card, and Cash</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎉</div>
              <h3>Special Offers</h3>
              <p>Daily deals and exclusive discounts for our customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories - Enhanced */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Menu</span>
            <h2>Popular Categories</h2>
            <p>Explore our most loved dishes</p>
          </div>
          <div className="category-grid">
            <div className="category-card" onClick={() => navigate('/menu')}>
              <div className="category-icon">🍕</div>
              <h3>Pizza</h3>
              <p>12+ varieties</p>
              <span className="category-price">From ₹299</span>
            </div>
            <div className="category-card" onClick={() => navigate('/menu')}>
              <div className="category-icon">🍔</div>
              <h3>Burgers</h3>
              <p>8+ varieties</p>
              <span className="category-price">From ₹199</span>
            </div>
            <div className="category-card" onClick={() => navigate('/menu')}>
              <div className="category-icon">🍝</div>
              <h3>Pasta</h3>
              <p>6+ varieties</p>
              <span className="category-price">From ₹249</span>
            </div>
            <div className="category-card" onClick={() => navigate('/menu')}>
              <div className="category-icon">🥗</div>
              <h3>Salads</h3>
              <p>5+ varieties</p>
              <span className="category-price">From ₹149</span>
            </div>
            <div className="category-card" onClick={() => navigate('/menu')}>
              <div className="category-icon">🥤</div>
              <h3>Beverages</h3>
              <p>10+ varieties</p>
              <span className="category-price">From ₹49</span>
            </div>
            <div className="category-card" onClick={() => navigate('/menu')}>
              <div className="category-icon">🍰</div>
              <h3>Desserts</h3>
              <p>8+ varieties</p>
              <span className="category-price">From ₹89</span>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers - Enhanced */}
      <section className="offers-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Limited Time Offer</span>
            <h2>Special Offers</h2>
            <p>Grab these deals before they're gone!</p>
          </div>
          <div className="offers-grid">
            <div className="offer-card">
              <div className="offer-tag">🔥 HOT DEAL</div>
              <h3>Combo Offer</h3>
              <p>Burger + Fries + Drink</p>
              <div className="offer-pricing">
                <span className="offer-price">₹399</span>
                <span className="original-price">₹499</span>
              </div>
              <Link to="/menu" className="offer-btn">Order Now</Link>
            </div>
            <div className="offer-card">
              <div className="offer-tag">🎉 BEST VALUE</div>
              <h3>Family Pack</h3>
              <p>2 Pizzas + 2 Sides</p>
              <div className="offer-pricing">
                <span className="offer-price">₹699</span>
                <span className="original-price">₹899</span>
              </div>
              <Link to="/menu" className="offer-btn">Order Now</Link>
            </div>
            <div className="offer-card">
              <div className="offer-tag">⭐ WEEKEND SPECIAL</div>
              <h3>Pasta Combo</h3>
              <p>Pasta + Garlic Bread + Drink</p>
              <div className="offer-pricing">
                <span className="offer-price">₹449</span>
                <span className="original-price">₹599</span>
              </div>
              <Link to="/menu" className="offer-btn">Order Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - New */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2>What Our Customers Say</h2>
            <p>Join thousands of satisfied customers</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p>"Amazing food and super fast delivery! Best food delivery app I've used."</p>
              <div className="testimonial-author">
                <strong>Rahul Sharma</strong>
                <span>⭐⭐⭐⭐⭐</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p>"Great variety of restaurants and the food always arrives hot. Love it!"</p>
              <div className="testimonial-author">
                <strong>Priya Patel</strong>
                <span>⭐⭐⭐⭐⭐</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p>"Easy to use app and great customer service. Highly recommended!"</p>
              <div className="testimonial-author">
                <strong>Amit Kumar</strong>
                <span>⭐⭐⭐⭐⭐</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - New */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Satisfy Your Cravings?</h2>
          <p>Download our app or order now to get started</p>
          <div className="cta-buttons">
            <Link to="/menu" className="cta-order-btn">Order Now 🚀</Link>
            {!user && (
              <Link to="/signup" className="cta-signup-btn">Sign Up Free →</Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🍔 Foodies</h3>
            <p>Delivering happiness, one meal at a time.</p>
            <div className="social-links">
              <a href="#">📱</a>
              <a href="#">📘</a>
              <a href="#">📷</a>
              <a href="#">🐦</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              {!user && <li><Link to="/login">Login</Link></li>}
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📞 +91 8904021086</p>
            <p>✉️ support@mannan200619@gmail.com</p>
            <p>📍 Banglore, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Foodies. All rights reserved. | Designed with ❤️ for food lovers</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;