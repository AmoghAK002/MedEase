import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-toastify';
import Logo from './Logo';

const ProfileSetup = ({ onProfileComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    caretakerPhone: '',
    caretakerEmail: '',
    profileCompleted: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Validate email format if caretaker email is provided
      if (formData.caretakerEmail && !isValidEmail(formData.caretakerEmail)) {
        throw new Error('Please enter a valid caretaker email address');
      }

      // Save profile data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        email: user.email,
        createdAt: new Date().toISOString()
      });

      // Update local state through the callback
      if (onProfileComplete) {
        onProfileComplete();
      }

      toast.success('Profile setup completed successfully!');
      
      // Add a small delay before navigation to ensure the toast is visible
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo-container">
            <Logo size="large" />
          </div>
          <h2>Complete Your Profile</h2>
          <p>Please provide your information to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">
              <i className="fas fa-user"></i> First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              <i className="fas fa-user"></i> Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">
              <i className="fas fa-calendar"></i> Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">
              <i className="fas fa-phone"></i> Your Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="caretakerPhone">
              <i className="fas fa-user-shield"></i> Caretaker's Phone Number
            </label>
            <input
              type="tel"
              id="caretakerPhone"
              name="caretakerPhone"
              value={formData.caretakerPhone}
              onChange={handleChange}
              required
              placeholder="Enter caretaker's phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="caretakerEmail">
              <i className="fas fa-envelope"></i> Caretaker's Email (Optional)
            </label>
            <input
              type="email"
              id="caretakerEmail"
              name="caretakerEmail"
              value={formData.caretakerEmail}
              onChange={handleChange}
              placeholder="Enter caretaker's email address"
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle"></i> Complete Profile Setup
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup; 