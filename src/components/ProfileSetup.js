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
    caretakerPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Save profile data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        email: user.email,
        profileCompleted: true,
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
    } catch (error) {
      toast.error('Error setting up profile: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
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

          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Setting up profile...
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