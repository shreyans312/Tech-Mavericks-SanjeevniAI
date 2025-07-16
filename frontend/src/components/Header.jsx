import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Absolute Logout/Auth Buttons Top Right */}
      <div className="topbar-absolute">
        {isAuthenticated && user ? (
          <div className="user-info">
            {/* <span className="welcome-text">Welcome, {user.fullName || user.username}!</span> */}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
            <button className="signup-btn" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        )}
      </div>

      {/* Main nav menu */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <img src="./public/image.png"/>
          </div>
          <div className="coin">
            <img src="./public/img3.png"/>
          </div>
          <t className="coin">250</t>
          <nav className="nav">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="/emergency">Emergency</a></li>
              <li><a href="./medical-chatbot.html">ChatBot</a></li>
              <li><a href="./public/ResourceLibrary">Resources</a></li>
              <li><a href="./public/EmergencyContacts">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;