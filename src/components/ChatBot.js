import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Message from "./Message";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your friendly health assistant. I can provide general health information and tips, but please remember I'm not a substitute for professional medical advice. How can I assist you today?"
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
      // Enhanced prompt for better health-related responses, with a disclaimer
      const prompt = `You are a knowledgeable and empathetic health assistant providing general health information. Emphasize that you are not a substitute for professional medical advice. Your role is to provide accurate, helpful, and easy-to-understand health information. Always:
1. Be clear and concise
2. Use bullet points for multiple items
3. Include relevant general medical context
4. **Strongly suggest consulting a healthcare professional for any specific medical concerns or before making any decisions related to their health.**
5. Format your response for easy reading

User's question: ${input}

Provide a helpful and accurate response (including the disclaimer):`;

      const response = await axios.post(
        "https://api.cohere.ai/generate",
        {
          model: "command",
          prompt: prompt,
          max_tokens: 1500,
          temperature: 0.7,
          stop_sequences: ["User:", "\n\n"],
          return_likelihoods: "NONE",
          p: 0.9,
          k: 0,
          num_generations: 1
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
          // Process and format the message
          const formattedText = botText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .join('\n\n');

          // Split into chunks if the message is very long
          const maxChunkLength = 1000;
          const chunks = [];
          let currentChunk = '';

          formattedText.split('\n\n').forEach(paragraph => {
            if ((currentChunk + paragraph).length > maxChunkLength) {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = paragraph;
            } else {
              currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
          });
          if (currentChunk) chunks.push(currentChunk);

          // Add messages in sequence with a small delay
          chunks.forEach((chunk, index) => {
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                sender: "bot", 
                text: chunk,
                isContinuation: index > 0 
              }]);
            }, index * 500); // 500ms delay between chunks
          });
        } else {
          throw new Error("Empty response from Cohere");
        }
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Cohere API Error:", error);
      const errorMsg = {
        sender: "bot",
        text: "I apologize, but I'm having trouble processing your request right now. Please try rephrasing your question or try again later."
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
      <div className="messages" style={{ flexGrow: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            sender={msg.sender} 
            text={msg.text} 
            isContinuation={msg.isContinuation}
          />
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
          placeholder="Type your health-related question... (Not a substitute for medical advice)"
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