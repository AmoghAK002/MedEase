import React, { useState, useEffect } from 'react';
import './Feedback.css';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [satisfaction, setSatisfaction] = useState('');
  const [easeOfUse, setEaseOfUse] = useState('');
  const [favorite, setFavorite] = useState('');
  const [leastFavorite, setLeastFavorite] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [recommend, setRecommend] = useState('');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('feedback_submitted') === 'true') {
      setAlreadySubmitted(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send feedback to your backend or service
    setSubmitted(true);
    localStorage.setItem('feedback_submitted', 'true');
    setAlreadySubmitted(true);
  };

  if (alreadySubmitted) {
    return (
      <div className="feedback-container">
        <div className="feedback-card">
          <div className="feedback-thankyou">
            <h2>Feedback Already Submitted</h2>
            <p>Thank you for your feedback! You have already submitted feedback for this session.</p>
            <div className="feedback-success-icon">&#10003;</div>
          </div>
        </div>

        {submitted && (
          <div className="alert alert-success mt-4" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            Thank you for your feedback! Your response has been recorded.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <h2 className="feedback-title">We Value Your Feedback!</h2>
            <p className="feedback-subtitle">Please rate your experience and answer a few quick questions to help us improve.</p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={star <= (hover || rating) ? 'on' : 'off'}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(rating)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <span className="star">&#9733;</span>
                </button>
              ))}
            </div>
            <div className="feedback-question-group">
              <label className="feedback-label">Overall, how satisfied are you with MedEase?</label>
              <select className="feedback-select" value={satisfaction} onChange={e => setSatisfaction(e.target.value)} required>
                <option value="" disabled>Select one</option>
                <option value="very_satisfied">Very satisfied</option>
                <option value="satisfied">Satisfied</option>
                <option value="neutral">Neutral</option>
                <option value="dissatisfied">Dissatisfied</option>
                <option value="very_dissatisfied">Very dissatisfied</option>
              </select>
            </div>
            <div className="feedback-question-group">
              <label className="feedback-label">How easy is it to use the app?</label>
              <select className="feedback-select" value={easeOfUse} onChange={e => setEaseOfUse(e.target.value)} required>
                <option value="" disabled>Select one</option>
                <option value="very_easy">Very easy</option>
                <option value="easy">Easy</option>
                <option value="neutral">Neutral</option>
                <option value="difficult">Difficult</option>
                <option value="very_difficult">Very difficult</option>
              </select>
            </div>
            <div className="feedback-question-group">
              <label className="feedback-label">What is your favorite feature?</label>
              <input
                className="feedback-input"
                type="text"
                placeholder="e.g. Medication reminders, Health vitals, etc."
                value={favorite}
                onChange={e => setFavorite(e.target.value)}
                required
              />
            </div>
            <div className="feedback-question-group">
              <label className="feedback-label">What is your least favorite feature?</label>
              <input
                className="feedback-input"
                type="text"
                placeholder="e.g. Navigation, Design, etc."
                value={leastFavorite}
                onChange={e => setLeastFavorite(e.target.value)}
                required
              />
            </div>
            <div className="feedback-question-group">
              <label className="feedback-label">Do you have any suggestions for improvement?</label>
              <textarea
                className="feedback-textarea"
                placeholder="Your suggestions..."
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
                rows={3}
                maxLength={300}
              />
            </div>
            <div className="feedback-question-group">
              <label className="feedback-label">Would you recommend MedEase to others?</label>
              <div className="feedback-radio-group">
                <label>
                  <input
                    type="radio"
                    name="recommend"
                    value="yes"
                    checked={recommend === 'yes'}
                    onChange={() => setRecommend('yes')}
                    required
                  /> Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="recommend"
                    value="no"
                    checked={recommend === 'no'}
                    onChange={() => setRecommend('no')}
                  /> No
                </label>
              </div>
            </div>
            <div className="feedback-question-group">
              <label className="feedback-label">Additional comments</label>
              <textarea
                className="feedback-textarea"
                placeholder="Your feedback..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                maxLength={500}
              />
            </div>
            <input
              className="feedback-email"
              type="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              className="feedback-submit"
              type="submit"
              disabled={
                rating === 0 ||
                !satisfaction ||
                !easeOfUse ||
                !favorite ||
                !leastFavorite ||
                !recommend
              }
            >
              Submit Feedback
            </button>
          </form>
        ) : (
          <div className="feedback-thankyou">
            <h2>Thank You!</h2>
            <p>Your feedback helps us improve your experience.</p>
            <div className="feedback-success-icon">&#10003;</div>
          </div>
        )}
      </div>

      {submitted && (
        <div className="alert alert-success mt-4" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          Thank you for your feedback! Your response has been recorded.
        </div>
      )}
    </div>
  );
};

export default Feedback; 