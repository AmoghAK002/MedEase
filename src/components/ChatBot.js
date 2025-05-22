import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Message from "./Message";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your friendly health assistant. How can I help you feel better today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        "https://api.cohere.ai/generate",
        {
          model: "command",
          prompt: `You are a kind, simple, elderly-friendly health assistant. Answer this politely and clearly:\n\nUser: ${input}\nAssistant:`,
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
          const botMessage = { sender: "bot", text: botText };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error("Empty response from Cohere");
        }
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Cohere API Error:", error);
      const errorMsg = {
        sender: "bot",
        text: "Sorry, I'm having trouble right now. Please try again later."
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows="1"
        />
        <button 
          onClick={sendMessage} 
          disabled={!input.trim() || isTyping}
          className={!input.trim() || isTyping ? 'disabled' : ''}
        >
          <i className="fas fa-paper-plane"></i>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot; 