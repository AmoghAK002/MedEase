import React, { useState, useEffect } from 'react';
import ChatBot from './ChatBot';
import './FloatingChatIcon.css';

const FloatingChatIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="floating-chat-wrapper">
      {isOpen ? (
        <div className="chat-overlay" onClick={() => setIsOpen(false)}>
          <div className="chat-window" onClick={e => e.stopPropagation()}>
            <div className="chat-header">
              <div className="chat-header-content">
                <i className="fas fa-robot"></i>
                <h3>Health Assistant</h3>
              </div>
              <button className="close-button" onClick={() => setIsOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <ChatBot />
          </div>
        </div>
      ) : (
        <button 
          className="floating-button"
          onClick={() => setIsOpen(true)}
          title="Chat with Health Assistant"
        >
          <i className="fas fa-comment-medical"></i>
        </button>
      )}
    </div>
  );
};

export default FloatingChatIcon; 