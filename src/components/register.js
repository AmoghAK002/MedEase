import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "./Logo";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters long and contain letters, numbers, and special symbols (@$!%*#?&)");
      return;
    }

    // Validate first name and last name (not numbers only)
    if (/^\d+$/.test(firstName)) {
      toast.error("First name cannot contain only numbers");
      return;
    }
    if (/^\d+$/.test(lastName)) {
      toast.error("Last name cannot contain only numbers");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        firstName: firstName,
        lastName: lastName,
        createdAt: new Date().toISOString(),
        photo: "https://www.gravatar.com/avatar/" + user.uid + "?d=mp",
        role: "patient",
        profileCompleted: false
      });

      toast.success("Account created successfully!");
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
          <h2>Create Your Account</h2>
          <p>Join MedEase for better healthcare management</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <i className="fas fa-user"></i> First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-user"></i> Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>

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
              placeholder="Create a password"
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <i className="fas fa-lock"></i> Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="auth-button">
            <i className="fas fa-user-plus"></i> Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button onClick={() => navigate("/login")} className="auth-link-button">
            <i className="fas fa-sign-in-alt"></i> Sign In
          </button>
        </div>

        <div className="auth-features">
          <div className="feature">
            <i className="fas fa-heartbeat"></i>
            <span>Track your health</span>
          </div>
          <div className="feature">
            <i className="fas fa-pills"></i>
            <span>Medicine reminders</span>
          </div>
          <div className="feature">
            <i className="fas fa-chart-line"></i>
            <span>Health Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;