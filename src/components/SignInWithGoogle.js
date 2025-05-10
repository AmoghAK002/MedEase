import React from "react";
import { auth, db } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function SignInWithGoogle() {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get user's name from Google account
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document with Google account details
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          role: "user",
          provider: "google"
        });
      }

      navigate("/dashboard");
      toast.success("Successfully signed in with Google!");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error(error.message);
    }
  };

  return (
    <button onClick={signInWithGoogle} className="auth-button google-button">
      <i className="fab fa-google"></i>
      <span>Sign in with Google</span>
    </button>
  );
}

export default SignInWithGoogle; 