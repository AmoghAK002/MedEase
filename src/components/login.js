import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Logo from "./Logo";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const checkUserRole = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData); // Debug log
        
        // Check if profile is completed by verifying required fields
        const isProfileComplete = userData.firstName && 
                                userData.lastName && 
                                userData.dateOfBirth && 
                                userData.phoneNumber && 
                                userData.caretakerPhone;
        
        if (isProfileComplete) {
          console.log("Profile is complete, navigating to dashboard");
          navigate("/dashboard");
        } else {
          console.log("Profile is incomplete, navigating to profile setup");
          navigate("/profile-setup");
        }
      } else {
        // New user - set role as patient
        await setDoc(userRef, {
          email: user.email,
          role: "patient",
          createdAt: new Date().toISOString()
        });
        navigate("/profile-setup");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      toast.error("Error checking user role");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      await checkUserRole(userCredential.user);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      toast.success("Logged in successfully!");
      await checkUserRole(userCredential.user);
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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Sign In
              </>
            )}
          </button>

          <div className="text-center mt-2">
            <a href="/forgot-password" className="auth-link">
              Forgot Password?
            </a>
          </div>
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