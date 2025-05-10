import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  return (
    <div className={`logo-container ${size}`}>
      <div className="logo-icon">
        <i className="fas fa-heartbeat"></i>
      </div>
      <div className="logo-text">
        <span className="logo-med">Med</span>
        <span className="logo-ease">Ease</span>
      </div>
    </div>
  );
};

export default Logo; 