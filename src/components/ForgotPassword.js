import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login', // Redirect URL after password reset
        handleCodeInApp: true // Handle the reset code in the app
      });

      setEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Password reset is not enabled for this account.';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    await handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo-container">
            <Logo size="large" />
          </div>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Send Reset Link
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="auth-success">
            <i className="fas fa-check-circle"></i>
            <h3>Email Sent!</h3>
            <p>Please check your inbox for the password reset link.</p>
            <p className="text-muted">If you don't see the email, please check your spam folder.</p>
            <button 
              onClick={handleResendEmail} 
              className="auth-link-button mt-3"
              disabled={loading}
            >
              <i className="fas fa-redo"></i> Resend Email
            </button>
          </div>
        )}

        <div className="auth-footer">
          <button onClick={() => navigate("/login")} className="auth-link-button">
            <i className="fas fa-arrow-left"></i> Back to Login
          </button>
        </div>

        <div className="auth-features">
          <div className="feature">
            <i className="fas fa-shield-alt"></i>
            <span>Secure Reset</span>
          </div>
          <div className="feature">
            <i className="fas fa-envelope"></i>
            <span>Email Verification</span>
          </div>
          <div className="feature">
            <i className="fas fa-lock"></i>
            <span>Password Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 