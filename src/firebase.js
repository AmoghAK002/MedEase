import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBZqi5DFGZ-ZFYLfjTRg4xQfz_SUSKdB34",
  authDomain: "medease-19faa.firebaseapp.com",
  projectId: "medease-19faa",
  storageBucket: "medease-19faa.firebasestorage.app",
  messagingSenderId: "478771719574",
  appId: "1:478771719574:web:5b60cf5880c1aa764681b7",
  measurementId: "G-R2EEB4H2C1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;