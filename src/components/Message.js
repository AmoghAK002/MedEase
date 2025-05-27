import React from "react";

const Message = ({ text, sender, isContinuation }) => {
  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('•')) {
        return (
          <p key={index} className="bullet-point">
            {line.trim()}
          </p>
        );
      }
      // Handle numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <p key={index} className="numbered-point">
            {line.trim()}
          </p>
        );
      }
      // Handle regular paragraphs
      return (
        <p key={index} className={line.trim() ? 'paragraph' : 'spacing'}>
          {line.trim()}
        </p>
      );
    });
  };

  return (
    <div
      className={`message ${sender === "bot" ? "bot-message" : "user-message"} ${isContinuation ? "continuation" : ""}`}
    >
      <div className="message-content">
        {!isContinuation && (
          <div className="message-header">
            <i className={`fas ${sender === "bot" ? "fa-robot" : "fa-user"}`}></i>
            <strong>{sender === "bot" ? "HealthBot" : "You"}</strong>
          </div>
        )}
        <div className="message-text">
          {formatMessage(text)}
        </div>
      </div>
    </div>
  );
};

export default Message; 