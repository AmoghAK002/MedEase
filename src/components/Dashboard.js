import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import Logo from './Logo';

// Initialize Cloudinary
const cld = new Cloudinary({ 
  cloud: { 
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'diq0qgpa8',
    apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY
  } 
});

// Health facts array
const healthFacts = [
  "Drinking water before meals can help with weight loss.",
  "Regular exercise can improve your mood and reduce stress.",
  "Getting 7-8 hours of sleep is crucial for good health.",
  "Eating slowly can help you eat less and feel fuller.",
  "Walking 10,000 steps daily can significantly improve your health.",
  "Meditation can reduce blood pressure and anxiety.",
  "Eating fruits and vegetables can boost your immune system.",
  "Regular stretching can improve flexibility and prevent injuries.",
  "Deep breathing exercises can help reduce stress.",
  "Maintaining good posture can prevent back pain.",
  "Drinking green tea can boost metabolism.",
  "Regular dental check-ups are important for overall health.",
  "Laughing can boost your immune system.",
  "Taking breaks from screens can reduce eye strain.",
  "Regular hand washing can prevent many illnesses."
];

// Add these styles at the top of the file
const reminderStyles = `
.reminder-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.reminder-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.reminder-modal-header {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 3px solid #f0f0f0;
}

.reminder-modal-header i {
  font-size: 3rem;
  color: #28a745;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.reminder-modal-header h3 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.medicine-info {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 1.3rem;
  padding: 10px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  font-size: 1.8rem;
  color: #28a745;
  margin-right: 20px;
  width: 40px;
  text-align: center;
}

.medicine-name h4 {
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.dosage h4 {
  font-size: 1.6rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.reminder-actions {
  text-align: center;
}

.mark-taken-btn {
  font-size: 1.4rem;
  padding: 18px 35px;
  border-radius: 15px;
  background-color: #28a745;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 350px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.mark-taken-btn:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.mark-taken-btn:active {
  transform: translateY(0);
}

.mark-taken-btn i {
  margin-right: 12px;
}

/* Add styles for the reminder cards */
.reminders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.reminder-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.reminder-card:hover {
  transform: translateY(-5px);
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.reminder-header h4 {
  font-size: 1.4rem;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.status-badge {
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.reminder-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1.1rem;
  color: #666;
}

.detail-item i {
  width: 25px;
  margin-right: 10px;
  color: #28a745;
}

.reminder-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Add styles for the add reminder form */
.add-reminder-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 3px solid #f0f0f0;
}

.card-header h3 {
  font-size: 1.6rem;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 1.1rem;
  color: #555;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
  outline: none;
}

.add-reminder-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 20px;
}

/* Add styles for the time slots */
.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.time-input {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
}

/* Add styles for the no reminders message */
.no-reminders {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 15px;
  margin: 20px;
}

.no-reminders i {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 15px;
}

.no-reminders p {
  font-size: 1.2rem;
  color: #6c757d;
  margin: 0;
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = reminderStyles;
document.head.appendChild(styleSheet);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userDetails, setUserDetails] = useState(null);
  const [bmiData, setBmiData] = useState(null);
  const [healthFact, setHealthFact] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set active tab based on current location
    const path = location.pathname.split('/').pop();
    setActiveTab(path || 'dashboard');
  }, [location]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          setBmiData(docSnap.data().bmiData || null);
        }
      }
    };
    fetchUserData();
    // Set a random health fact
    setHealthFact(healthFacts[Math.floor(Math.random() * healthFacts.length)]);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Error loading user profile");
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="user-info">
          <Logo size="large" />
          {userProfile && (
            <p className="welcome-text">Welcome, {userProfile.firstName}!</p>
          )}
        </div>
        <nav>
          <ul className="nav-links">
            <li className={activeTab === 'dashboard' ? 'active' : ''}>
              <Link to="/dashboard">
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={activeTab === 'profile' ? 'active' : ''}>
              <Link to="/dashboard/profile">
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </Link>
            </li>
            <li className={activeTab === 'medical-records' ? 'active' : ''}>
              <Link to="/dashboard/medical-records">
                <i className="fas fa-file-medical"></i>
                <span>Medical Records</span>
              </Link>
            </li>
            <li className={activeTab === 'reminders' ? 'active' : ''}>
              <Link to="/dashboard/reminders">
                <i className="fas fa-bell"></i>
                <span>Medicine Reminders</span>
              </Link>
            </li>
            <li className={activeTab === 'bmi' ? 'active' : ''}>
              <Link to="/dashboard/bmi">
                <i className="fas fa-weight"></i>
                <span>BMI Calculator</span>
              </Link>
            </li>
            <li className={activeTab === 'therapy' ? 'active' : ''}>
              <Link to="/dashboard/therapy">
                <i className="fas fa-brain"></i>
                <span>Mental Health</span>
              </Link>
            </li>
            <li onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardHome 
            userProfile={userProfile} 
            bmiData={bmiData} 
            healthFact={healthFact} 
          />} />
          <Route path="/profile" element={<ProfileSection userProfile={userProfile} />} />
          <Route path="/medical-records" element={<MedicalRecordsSection />} />
          <Route path="/reminders" element={<MedicineRemindersSection />} />
          <Route path="/bmi" element={<BMICalculatorSection onBMICalculated={setBmiData} />} />
          <Route path="/therapy" element={<TherapySection />} />
        </Routes>
      </div>
    </div>
  );
};

// Dashboard Home Component
function DashboardHome({ userProfile, bmiData, healthFact }) {
  const [stats, setStats] = useState({
    documentCount: 0,
    reminderCount: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setStats({
              documentCount: userData.medicalRecords?.length || 0,
              reminderCount: userData.reminders?.length || 0
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
        toast.error("Error loading user statistics");
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="dashboard-home">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome to MedEase, {userProfile?.firstName}!</h2>
          <p>Your complete healthcare management solution</p>
        </div>
        <div className="welcome-heart">
          <i className="fas fa-heartbeat"></i>
        </div>
      </div>
      
      <div className="quick-stats">
        <div className="stat-card">
          <i className="fas fa-pills"></i>
          <h3>Today's Reminders</h3>
          <p>{stats.reminderCount} medications</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-file-medical"></i>
          <h3>Medical Records</h3>
          <p>{stats.documentCount} documents</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-weight"></i>
          <h3>BMI Status</h3>
          <p>{bmiData ? `${bmiData.value} (${bmiData.category})` : 'Not calculated'}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {stats.documentCount > 0 && (
              <div className="activity-item">
                <i className="fas fa-file-upload"></i>
                <span>Medical records uploaded</span>
                <small>{stats.documentCount} documents</small>
              </div>
            )}
            {stats.reminderCount > 0 && (
              <div className="activity-item">
                <i className="fas fa-bell"></i>
                <span>Active reminders</span>
                <small>{stats.reminderCount} medications</small>
              </div>
            )}
          </div>
        </div>

        <div className="health-fact-card">
          <div className="fact-icon">
            <i className="fas fa-lightbulb"></i>
          </div>
          <h3>Health Tip of the Day</h3>
          <p>{healthFact}</p>
        </div>
      </div>
    </div>
  );
}

// BMI Calculator Section Component
function BMICalculatorSection({ onBMICalculated }) {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBMI] = useState(null);
  const [bmiCategory, setBMICategory] = useState('');

  const calculateBMI = async () => {
    if (age && weight && height) {
      // Convert height from cm to m
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBMI(bmiValue);

      // Determine BMI category
      let category;
      if (bmiValue < 18.5) {
        category = 'Underweight';
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        category = 'Normal weight';
      } else if (bmiValue >= 25 && bmiValue < 30) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }
      setBMICategory(category);

      // Save BMI data to Firestore
      const user = auth.currentUser;
      if (user) {
        const bmiData = {
          value: bmiValue,
          category: category,
          date: new Date().toISOString()
        };
        await setDoc(doc(db, "Users", user.uid), {
          bmiData: bmiData
        }, { merge: true });
        onBMICalculated(bmiData);
      }
    }
  };

  return (
    <div className="section bmi-calculator">
      <h2>BMI Calculator</h2>
      <div className="bmi-form">
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
          />
        </div>
        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter your weight"
          />
        </div>
        <div className="form-group">
          <label>Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter your height"
          />
        </div>
        <button className="btn btn-primary" onClick={calculateBMI}>
          Calculate BMI
        </button>
      </div>

      {bmi && (
        <div className="bmi-result">
          <h3>Your BMI Result</h3>
          <div className="bmi-value">{bmi}</div>
          <div className="bmi-category">{bmiCategory}</div>
          <div className="bmi-info">
            <p>BMI Categories:</p>
            <ul>
              <li>Underweight: BMI less than 18.5</li>
              <li>Normal weight: BMI 18.5-24.9</li>
              <li>Overweight: BMI 25-29.9</li>
              <li>Obese: BMI 30 or higher</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Medicine Reminders Section Component
function MedicineRemindersSection() {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    medicine: '',
    times: [''],
    dosage: '',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });
  const [dueReminder, setDueReminder] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const intervalRef = useRef();
  const audioRef = useRef(null);
  const lastCheckedTimeRef = useRef('');
  const notificationTimeoutRef = useRef(null);

  // Initialize audio and request notification permission
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.load(); // Preload the audio

    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Function to format time to 12-hour format with AM/PM
  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };

  // Function to check if it's time for a reminder
  const isTimeForReminder = (reminderTime) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    return currentTime === reminderTime;
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      // Reset the audio to start
      audioRef.current.currentTime = 0;
      // Play the sound
      audioRef.current.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    }
  };

  // Function to show reminder notification
  const showReminderNotification = (reminder) => {
    // Clear any existing notification timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    setDueReminder(reminder);
    
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification
    if ('Notification' in window && notificationPermission === 'granted') {
      const notification = new Notification('Time to Take Your Medicine!', {
        body: `Please take ${reminder.medicine} - ${reminder.dosage}`,
        icon: '/medicine-icon.png',
        requireInteraction: true,
        tag: `reminder-${reminder.id}`
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }

    // Set up periodic sound reminder every 5 minutes until taken
    notificationTimeoutRef.current = setInterval(() => {
      playNotificationSound();
    }, 300000); // 5 minutes
  };

  // Check for due reminders
  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDate = now.toISOString().split('T')[0];

      // Check if we need to update the last checked time
      if (currentTime !== lastCheckedTimeRef.current) {
        lastCheckedTimeRef.current = currentTime;

        // Find due reminders
        const due = reminders.find(r => 
          !r.completed && 
          r.time === currentTime &&
          (!r.endDate || r.endDate >= currentDate) &&
          (!r.lastTaken || r.lastTaken.split('T')[0] !== currentDate)
        );

        if (due) {
          showReminderNotification(due);
        }
      }
    };

    // Check every 15 seconds
    intervalRef.current = setInterval(checkDueReminders, 15000);
    
    // Initial check
    checkDueReminders();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [reminders, notificationPermission]);

  const markAsTaken = async (reminderId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];

      // Get current reminders
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const currentReminders = userData?.reminders || [];

      // Update the reminder
      const updatedReminders = currentReminders.map(reminder => {
        if (reminder.id === reminderId) {
          const lastTakenDate = reminder.lastTaken ? reminder.lastTaken.split('T')[0] : null;
          const streak = lastTakenDate === currentDate ? reminder.streak : reminder.streak + 1;
          
          return {
            ...reminder,
            completed: true,
            completedAt: now.toISOString(),
            lastTaken: now.toISOString(),
            streak
          };
        }
        return reminder;
      });

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        reminders: updatedReminders
      });

      // Update local state
      setReminders(updatedReminders);
      setDueReminder(null);

      // Clear notification timeout
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      toast.success('Medication marked as taken!');
    } catch (error) {
      console.error("Error marking reminder as taken:", error);
      toast.error("Error updating reminder status");
    }
  };

  // Fetch reminders when component mounts
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userReminders = userData.reminders || [];
            // Filter out expired reminders
            const currentDate = new Date().toISOString().split('T')[0];
            const activeReminders = userReminders.filter(reminder => 
              !reminder.endDate || reminder.endDate >= currentDate
            );
            setReminders(activeReminders);
          }
        }
      } catch (error) {
        console.error("Error fetching reminders:", error);
        toast.error("Error loading reminders");
      }
    };
    fetchReminders();
  }, []);

  // Save reminders whenever they change
  useEffect(() => {
    const saveReminders = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, "users", user.uid), {
            reminders: reminders
          });
        }
      } catch (error) {
        console.error("Error saving reminders:", error);
        toast.error("Error saving reminders");
      }
    };

    if (reminders.length > 0) {
      saveReminders();
    }
  }, [reminders]);

  const addReminder = async () => {
    if (!newReminder.medicine || !newReminder.dosage || newReminder.times.some(time => !time)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const newReminders = newReminder.times.map((time, index) => ({
        id: Date.now() + index,
        medicine: newReminder.medicine,
        time,
        dosage: newReminder.dosage,
        frequency: newReminder.frequency,
        startDate: newReminder.startDate,
        endDate: newReminder.endDate || null,
        notes: newReminder.notes || '',
        createdAt: new Date().toISOString(),
        completed: false,
        userId: user.uid,
        lastTaken: null,
        streak: 0 // Add streak counter
      }));

      // Get current reminders
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const currentReminders = userData?.reminders || [];

      // Combine old and new reminders
      const updatedReminders = [...currentReminders, ...newReminders];

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        reminders: updatedReminders
      });

      // Update local state
      setReminders(updatedReminders);
      setNewReminder({
        medicine: '',
        times: [''],
        dosage: '',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: ''
      });

      toast.success('Reminder(s) added successfully!');
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast.error("Error adding reminder");
    }
  };

  const deleteReminder = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Get current reminders
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const currentReminders = userData?.reminders || [];

      // Remove the reminder
      const updatedReminders = currentReminders.filter(reminder => reminder.id !== id);

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        reminders: updatedReminders
      });

      // Update local state
      setReminders(updatedReminders);
      toast.success('Reminder deleted successfully!');
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Error deleting reminder");
    }
  };

  return (
    <div className="reminders-section">
      <div className="section-header">
        <h2><i className="fas fa-pills"></i> Medicine Reminders</h2>
        <p className="section-description">Manage your medication schedule and never miss a dose</p>
      </div>
      
      <div className="reminders-container">
        <div className="add-reminder-card">
          <div className="card-header">
            <h3><i className="fas fa-plus-circle"></i> Add New Reminder</h3>
          </div>
          <div className="reminder-form">
            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-capsules"></i> Medicine Name</label>
                <input
                  type="text"
                  value={newReminder.medicine}
                  onChange={(e) => setNewReminder({ ...newReminder, medicine: e.target.value })}
                  placeholder="Enter medicine name"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label><i className="fas fa-sync"></i> Frequency</label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) => {
                    const frequency = e.target.value;
                    const times = frequency === 'daily' ? [''] : 
                                 frequency === 'twice' ? ['', ''] : 
                                 ['', '', ''];
                    setNewReminder({ ...newReminder, frequency, times });
                  }}
                  className="form-control"
                >
                  <option value="daily">Once a day</option>
                  <option value="twice">Twice a day</option>
                  <option value="thrice">Three times a day</option>
                </select>
              </div>
            </div>

            <div className="time-slots">
              {newReminder.times.map((time, index) => (
                <div key={index} className="form-group time-input">
                  <label>
                    <i className="fas fa-clock"></i> 
                    Time {index + 1}
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...newReminder.times];
                      newTimes[index] = e.target.value;
                      setNewReminder({ ...newReminder, times: newTimes });
                    }}
                    className="form-control"
                  />
                </div>
              ))}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><i className="fas fa-calendar"></i> Start Date</label>
                <input
                  type="date"
                  value={newReminder.startDate}
                  onChange={(e) => setNewReminder({ ...newReminder, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label><i className="fas fa-calendar-times"></i> End Date (Optional)</label>
                <input
                  type="date"
                  value={newReminder.endDate}
                  onChange={(e) => setNewReminder({ ...newReminder, endDate: e.target.value })}
                  min={newReminder.startDate}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label><i className="fas fa-balance-scale"></i> Dosage</label>
              <input
                type="text"
                value={newReminder.dosage}
                onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                placeholder="Enter dosage (e.g., 1 tablet)"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label><i className="fas fa-sticky-note"></i> Notes (Optional)</label>
              <textarea
                value={newReminder.notes}
                onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                placeholder="Add any special instructions or notes"
                className="form-control"
                rows="3"
              />
            </div>

            <button 
              onClick={addReminder}
              className="btn btn-primary add-reminder-btn"
            >
              <i className="fas fa-plus"></i> Add Reminder
            </button>
          </div>
        </div>

        {/* Persistent Reminder Modal */}
        {dueReminder && (
          <div className="reminder-modal-overlay">
            <div className="reminder-modal">
              <div className="reminder-modal-content">
                <div className="reminder-modal-header">
                  <i className="fas fa-bell"></i>
                  <h3>Time to Take Your Medicine!</h3>
                </div>
                <div className="reminder-modal-body">
                  <div className="medicine-info">
                    <div className="info-item medicine-name">
                      <i className="fas fa-pills"></i>
                      <h4>{dueReminder.medicine}</h4>
                    </div>
                    <div className="info-item dosage">
                      <i className="fas fa-balance-scale"></i>
                      <h4>{dueReminder.dosage}</h4>
                    </div>
                    <div className="info-item time">
                      <i className="fas fa-clock"></i>
                      <span>{formatTime(dueReminder.time)}</span>
                    </div>
                    {dueReminder.notes && (
                      <div className="info-item notes">
                        <i className="fas fa-sticky-note"></i>
                        <span>{dueReminder.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="reminder-actions">
                    <button 
                      onClick={() => markAsTaken(dueReminder.id)}
                      className="btn btn-success mark-taken-btn"
                    >
                      <i className="fas fa-check"></i> TABLET TAKEN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="reminders-list">
          <div className="list-header">
            <h3><i className="fas fa-list"></i> Your Reminders</h3>
            <span className="reminder-count">{reminders.length} active reminders</span>
          </div>
          
          {reminders.length === 0 ? (
            <div className="no-reminders">
              <i className="fas fa-bell-slash"></i>
              <p>No reminders set. Add your first reminder above!</p>
            </div>
          ) : (
            <div className="reminders-grid">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className={`reminder-card ${reminder.completed ? 'completed' : ''}`}
                >
                  <div className="reminder-header">
                    <h4><i className="fas fa-pills"></i> {reminder.medicine}</h4>
                    <span className={`status-badge ${reminder.completed ? 'completed' : 'pending'}`}>
                      {reminder.completed ? 'Taken' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="reminder-details">
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>{formatTime(reminder.time)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-sync"></i>
                      <span>{reminder.frequency}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-balance-scale"></i>
                      <span>{reminder.dosage}</span>
                    </div>
                    {reminder.streak > 0 && (
                      <div className="detail-item">
                        <i className="fas fa-fire"></i>
                        <span>{reminder.streak} day streak</span>
                      </div>
                    )}
                    {reminder.notes && (
                      <div className="detail-item">
                        <i className="fas fa-sticky-note"></i>
                        <span>{reminder.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="reminder-actions">
                    {!reminder.completed && (
                      <button
                        onClick={() => markAsTaken(reminder.id)}
                        className="btn btn-success action-btn"
                      >
                        <i className="fas fa-check"></i> Mark as Taken
                      </button>
                    )}
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="btn btn-danger action-btn"
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Section Component with improved UI
function ProfileSection({ userProfile }) {
  return (
    <div className="section profile-section">
      <div className="profile-header-banner">
        <div className="profile-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <h2>Profile Information</h2>
      </div>
      
      {userProfile ? (
        <div className="profile-content">
          <div className="profile-grid">
            <div className="profile-card personal-info">
              <div className="profile-card-header">
                <i className="fas fa-user"></i>
                <h3>Personal Information</h3>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <label><i className="fas fa-user-tag"></i> Full Name</label>
                  <p>{`${userProfile.firstName} ${userProfile.lastName}`}</p>
                </div>
                <div className="detail-item">
                  <label><i className="fas fa-envelope"></i> Email</label>
                  <p>{userProfile.email}</p>
                </div>
                <div className="detail-item">
                  <label><i className="fas fa-calendar-alt"></i> Date of Birth</label>
                  <p>{new Date(userProfile.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="profile-card contact-info">
              <div className="profile-card-header">
                <i className="fas fa-address-book"></i>
                <h3>Contact Information</h3>
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <label><i className="fas fa-phone"></i> Phone Number</label>
                  <p>{userProfile.phoneNumber}</p>
                </div>
                <div className="detail-item">
                  <label><i className="fas fa-user-shield"></i> Caretaker's Phone</label>
                  <p>{userProfile.caretakerPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-profile">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading profile information...</p>
        </div>
      )}
    </div>
  );
}

// Therapy Section Component
function TherapySection() {
  return (
    <div className="section">
      <h2>Mental Health Resources</h2>
      <div className="therapy-content">
        {/* Therapy content will go here */}
      </div>
    </div>
  );
}

// Medical Records Section Component
function MedicalRecordsSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [records, setRecords] = useState([]);
  const [recordType, setRecordType] = useState('prescription');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch records when component mounts
  useEffect(() => {
    fetchRecords();
  }, []);

  // Create preview URL when file is selected
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const fetchRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.medicalRecords) {
          // Sort records by upload date, newest first
          const sortedRecords = [...userData.medicalRecords].sort((a, b) => 
            new Date(b.uploadDate) - new Date(a.uploadDate)
          );
          setRecords(sortedRecords);
        }
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Error loading medical records');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only JPG, PNG, or PDF files');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setUploadStatus(null);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'ml_default');
      
      // Add user-specific folder
      const user = auth.currentUser;
      if (user) {
        formData.append('folder', `users/${user.uid}/medical_records`);
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/diq0qgpa8/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      
      if (data.secure_url) {
        const user = auth.currentUser;
        if (user) {
          const recordData = {
            url: data.secure_url,
            publicId: data.public_id,
            fileName: selectedFile.name,
            type: recordType,
            uploadDate: new Date().toISOString(),
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
            lastModified: selectedFile.lastModified,
            userId: user.uid // Add user ID to track ownership
          };

          // Get existing records
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          const existingRecords = userData?.medicalRecords || [];

          // Add new record to the beginning of the array
          const updatedRecords = [recordData, ...existingRecords];

          // Update Firestore with the new records array
          await updateDoc(doc(db, "users", user.uid), {
            medicalRecords: updatedRecords
          });

          // Update local state
          setRecords(updatedRecords);
          setUploadStatus('success');
          toast.success('Medical record uploaded successfully!');
          
          // Reset form and preview
          setSelectedFile(null);
          setPreviewUrl(null);
          document.querySelector('.file-input').value = '';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error(`Error uploading medical record: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setUploadStatus(null);
        setUploadProgress(0);
      }, 2000);
    }
  };

  const deleteRecord = async (recordToDelete) => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Get current records
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const currentRecords = userData?.medicalRecords || [];

        // Remove the record to delete
        const updatedRecords = currentRecords.filter(record => 
          record.publicId !== recordToDelete.publicId
        );
        
        // Update Firestore
        await updateDoc(doc(db, "users", user.uid), {
          medicalRecords: updatedRecords
        });

        // Update local state
        setRecords(updatedRecords);
        toast.success('Record deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error deleting record');
    }
  };

  const renderPreview = (record) => {
    if (record.fileType.includes('pdf')) {
      return (
        <div className="pdf-preview">
          <i className="fas fa-file-pdf"></i>
          <a 
            href={record.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="preview-link"
          >
            View PDF
          </a>
        </div>
      );
    }
    return (
      <AdvancedImage
        cldImg={cld.image(record.publicId)}
        className="record-image"
        alt={record.fileName}
      />
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="medical-records-container">
      <h2>Medical Records</h2>
      
      <div className="upload-section">
        <div className="form-group">
          <label>Record Type</label>
          <select 
            value={recordType} 
            onChange={(e) => setRecordType(e.target.value)}
            className="form-control"
          >
            <option value="prescription">Prescription</option>
            <option value="labReport">Lab Report</option>
            <option value="xray">X-Ray</option>
            <option value="mri">MRI Scan</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="file-upload">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
            className="file-input"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="upload-button"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i> Upload Record
              </>
            )}
          </button>
        </div>

        {selectedFile && (
          <div className="upload-preview">
            <h4>Preview</h4>
            {selectedFile.type.includes('pdf') ? (
              <div className="pdf-preview">
                <i className="fas fa-file-pdf"></i>
                <span>{selectedFile.name}</span>
              </div>
            ) : (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="preview-image"
              />
            )}
          </div>
        )}

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus}`}>
            {uploadStatus === 'uploading' && (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress}%</span>
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="status-message success">
                <i className="fas fa-check-circle"></i>
                Upload successful!
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="status-message error">
                <i className="fas fa-exclamation-circle"></i>
                Upload failed. Please try again.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="records-section">
        <h3>Your Medical Records</h3>
        {isLoadingRecords ? (
          <div className="loading-records">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="no-records">
            <i className="fas fa-file-medical"></i>
            <p>No medical records uploaded yet</p>
          </div>
        ) : (
          <div className="records-grid">
            {records.map((record, index) => (
              <div key={index} className="record-card">
                <div className="record-preview">
                  {renderPreview(record)}
                </div>
                <div className="record-info">
                  <div className="record-type">
                    <i className="fas fa-tag"></i>
                    <span>{record.type}</span>
                  </div>
                  <div className="record-name">
                    <i className="fas fa-file"></i>
                    <span>{record.fileName}</span>
                  </div>
                  <div className="record-details">
                    <div className="record-date">
                      <i className="fas fa-calendar"></i>
                      <span>{new Date(record.uploadDate).toLocaleDateString()}</span>
                    </div>
                    <div className="record-size">
                      <i className="fas fa-weight"></i>
                      <span>{formatFileSize(record.fileSize)}</span>
                    </div>
                  </div>
                  <div className="record-actions">
                    <a 
                      href={record.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-button"
                    >
                      <i className="fas fa-eye"></i> View
                    </a>
                    <button 
                      onClick={() => deleteRecord(record)}
                      className="delete-button"
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 