import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import Logo from "./Logo";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo-container">
            <Logo size="large" />
          </div>
          <h2>Welcome Back!</h2>
          <p>Sign in to continue your healthcare journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-lock"></i> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            <i className="fas fa-sign-in-alt"></i> Sign In
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button onClick={handleGoogleSignIn} className="auth-button google-button">
          <i className="fab fa-google"></i> Sign in with Google
        </button>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button onClick={() => navigate("/register")} className="auth-link-button">
            <i className="fas fa-user-plus"></i> Create Account
          </button>
        </div>

        <div className="auth-features">
          <div className="feature">
            <i className="fas fa-shield-alt"></i>
            <span>Secure Login</span>
          </div>
          <div className="feature">
            <i className="fas fa-history"></i>
            <span>Access History</span>
          </div>
          <div className="feature">
            <i className="fas fa-heartbeat"></i>
            <span>Health Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;