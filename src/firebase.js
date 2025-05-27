import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  REFILL_REMINDERS: 'refillReminders',
  MEDICAL_RECORDS: 'medicalRecords',
  HEALTH_METRICS: 'healthMetrics'
};

// Security rules (these should be set in Firebase Console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Nested refill reminders
      match /refillReminders/{reminderId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
*/

export { auth, db, analytics, COLLECTIONS };

export default app;