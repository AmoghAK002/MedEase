import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/custom.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/login.js";
import SignUp from "./components/register.js";
import Dashboard from "./components/Dashboard.js";
import ProfileSetup from "./components/ProfileSetup.js";
import ForgotPassword from "./components/ForgotPassword.js";
import FloatingChatIcon from "./components/FloatingChatIcon.js";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          setProfileCompleted(userDoc.exists() && userData?.profileCompleted);
        } catch (error) {
          console.error("Error checking profile:", error);
          setProfileCompleted(false);
        }
      } else {
        setProfileCompleted(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                profileCompleted ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/profile-setup"
            element={
              user ? (
                profileCompleted ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <ProfileSetup onProfileComplete={() => setProfileCompleted(true)} />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/dashboard/*"
            element={
              user ? (
                profileCompleted ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
        {user && profileCompleted && <FloatingChatIcon />}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;