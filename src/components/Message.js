import React from "react";

const Message = ({ text, sender }) => {
  return (
    <div
      className={`message ${sender === "bot" ? "bot-message" : "user-message"}`}
    >
      <div className="message-content">
        <div className="message-header">
          <i className={`fas ${sender === "bot" ? "fa-robot" : "fa-user"}`}></i>
          <strong>{sender === "bot" ? "HealthBot" : "You"}</strong>
        </div>
        <div className="message-text">{text}</div>
      </div>
    </div>
  );
};

export default Message; 