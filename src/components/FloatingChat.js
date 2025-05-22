import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import axios from 'axios';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your friendly health assistant. How can I help you feel better today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsTyping(true);

    try {
      const response = await axios.post(
        "https://api.cohere.ai/generate",
        {
          model: "command",
          prompt: `You are a kind, simple, elderly-friendly health assistant. Answer this politely and clearly:\n\nUser: ${userMessage}\nAssistant:`,
          max_tokens: 100,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_COHERE_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Simulate typing delay
      setTimeout(() => {
        const botText = response.data.text?.trim();
        if (botText) {
          setMessages(prev => [...prev, { text: botText, sender: 'bot' }]);
        } else {
          throw new Error("Empty response from Cohere");
        }
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response from chatbot');
      setMessages(prev => [...prev, { 
        text: 'I apologize, but I\'m having trouble connecting right now. Please try again later.', 
        sender: 'bot' 
      }]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`floating-chat ${isOpen ? 'open' : ''}`}>
      <button 
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close Chat' : 'Open Chat'}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-medical'}`}></i>
      </button>

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3><i className="fas fa-robot"></i> Health Assistant</h3>
            <p>Ask me anything about your health</p>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">
                  {message.sender === 'bot' ? (
                    <div className="bot-message">
                      <div className="bot-avatar">
                        <i className="fas fa-robot"></i>
                      </div>
                      <div className="message-text">
                        {message.text.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('•') ? 'bullet-point' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="user-message">
                      <div className="message-text">
                        {message.text}
                      </div>
                      <div className="user-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="bot-message">
                    <div className="bot-avatar">
                      <i className="fas fa-robot"></i>
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat; 