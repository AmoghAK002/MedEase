import React from 'react';
import Feedback from '../components/Feedback';
import '../components/Feedback.css';

const FeedbackPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0f7fa 0%, #f8fafc 100%)' }}>
    <Feedback />
  </div>
);

export default FeedbackPage; 