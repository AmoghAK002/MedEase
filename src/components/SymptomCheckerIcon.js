import React, { useState } from 'react';
import './FloatingChatIcon.css';

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Sore throat', 'Nausea', 'Pain', 'Shortness of breath'
];

function SymptomCheckerIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! I can help you check your symptoms. Please type or select a symptom below.' }
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    // Basic advice logic (placeholder)
    setTimeout(() => {
      setMessages(msgs => ([
        ...msgs,
        { from: 'bot', text: 'Thank you for sharing. For common symptoms, rest, hydration, and monitoring are advised. If symptoms worsen, consult a doctor.' }
      ]));
    }, 800);
    setInput('');
  };

  const handleSymptomClick = (symptom) => {
    setInput(symptom);
  };

  return (
    <div
      className="floating-container"
      style={{
        position: 'fixed',
        right: '30px',
        bottom: '100px',
        zIndex: 1001
      }}
    >
      <button className="floating-button" onClick={toggleChat} style={{ background: 'linear-gradient(135deg, #4CAF50, #2E7D32)' }}>
        <i className="fas fa-stethoscope" style={{ fontSize: 30 }}></i>
      </button>
      {isOpen && (
        <div className="chat-window" style={{ width: 380, maxWidth: '90vw', minHeight: 420, fontSize: 20, borderRadius: 22 }}>
          <div className="chat-header" style={{ fontSize: 24, padding: 24, borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 24, letterSpacing: 1 }}>Symptom Checker</h3>
            <button className="close-button" onClick={toggleChat} style={{ fontSize: 28, marginLeft: 10 }} aria-label="Close chat">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div style={{ padding: '18px 20px 0 20px', background: '#f9f9f9', minHeight: 120 }}>
            <div style={{ fontSize: 18, color: '#222', marginBottom: 10, fontWeight: 500 }}>
              Please select a symptom or type your concern below:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              {COMMON_SYMPTOMS.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomClick(symptom)}
                  style={{
                    fontSize: 18,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1.5px solid #4CAF50',
                    background: '#fff',
                    color: '#2563eb',
                    cursor: 'pointer',
                    marginBottom: 4,
                    fontWeight: 600
                  }}
                  aria-label={symptom}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', background: '#f9f9f9', fontSize: 20, minHeight: 120 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                textAlign: msg.from === 'bot' ? 'left' : 'right',
                margin: '12px 0',
                fontSize: 20
              }}>
                <span style={{
                  display: 'inline-block',
                  background: msg.from === 'bot' ? '#e3fcec' : '#dbeafe',
                  color: '#222',
                  borderRadius: 12,
                  padding: '12px 18px',
                  maxWidth: '80%',
                  fontWeight: msg.from === 'bot' ? 500 : 600
                }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="chat-input" style={{ display: 'flex', alignItems: 'center', padding: 18, background: '#fff', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="chat-input-field"
              style={{
                fontSize: 20,
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #4CAF50',
                flex: 1,
                marginRight: 12
              }}
              aria-label="Describe your symptoms"
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <button
              className="send-button"
              onClick={handleSend}
              style={{
                fontSize: 20,
                padding: '12px 22px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                marginLeft: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              aria-label="Send"
            >
              <i className="fas fa-paper-plane" style={{ fontSize: 22 }}></i>
              <span style={{ fontSize: 20, fontWeight: 700 }}>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomCheckerIcon; 