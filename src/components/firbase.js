// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZqi5DFGZ-ZFYLfjTRg4xQfz_SUSKdB34",
  authDomain: "medease-19faa.firebaseapp.com",
  projectId: "medease-19faa",
  storageBucket: "medease-19faa.firebasestorage.app",
  messagingSenderId: "478771719574",
  appId: "1:478771719574:web:5b60cf5880c1aa764681b7",
  measurementId: "G-R2EEB4H2C1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;