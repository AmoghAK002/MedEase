import React, { useState, useEffect, useRef, useCallback } from "react";
import { auth, db, COLLECTIONS } from "../firebase";
import {
  useNavigate,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { toast } from "react-toastify";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Logo from "./Logo";
import RefillReminders from "./RefillReminders";
import Login from "./login";
import SignUp from "./register";
import ForgotPassword from "./ForgotPassword";
import FloatingChatIcon from "./FloatingChatIcon";
import HealthVitalsTracker from './HealthVitalsTracker';
import YourGuide from './YourGuide';
import Feedback from './Feedback';

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
  "Regular hand washing can prevent many illnesses.",
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

// Function to determine refill urgency level (copied from RefillReminders.js)
const getUrgencyLevel = (refillDate) => {
  if (!refillDate) return "low";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const refill = new Date(refillDate);
  refill.setHours(0, 0, 0, 0);
  const diff = (refill.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diff < 0) return "critical";
  if (diff <= 1) return "critical";
  if (diff <= 2) return "urgent";
  if (diff <= 3) return "warning"; // Using DAYS_BEFORE_REFILL = 3
  return "low";
};

// Add this helper function at the top-level of the file (outside the component):
async function downloadPdfFromUrl(url, filename = 'document.pdf') {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert('Failed to download PDF.');
  }
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bmiData, setBmiData] = useState(null);
  const [healthFact, setHealthFact] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // <-- Add this
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Set active tab based on current location
    const path = location.pathname.split("/").pop();
    setActiveTab(path || "dashboard");
  }, [location]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBmiData(docSnap.data().bmiData || null);
        }
      }
    };
    fetchUserData();
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
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const isDashboardHome =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  return (
    <div className="dashboard-container">
      {/* Hamburger for mobile */}
      {isMobile && !sidebarOpen && (
        <button
          className="sidebar-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
      )}
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      {/* Sidebar: only show on desktop or when open on mobile */}
      {(!isMobile || sidebarOpen) && (
        <div className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {/* Mobile: Close button, logo, welcome text */}
          {isMobile && (
            <>
              <button
                className="sidebar-close-btn"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="sidebar-logo-welcome">
                <Logo size="large" />
                {userProfile && (
                  <div className="sidebar-welcome-text">
                    Welcome, {userProfile.firstName}!
                  </div>
                )}
              </div>
            </>
          )}
          {/* Desktop: Logo at top as before */}
          {!isMobile && (
            <div className="user-info">
              <Logo size="large" />
            </div>
          )}
          <nav>
            <ul className="nav-links">
              <li
                className={activeTab === "dashboard" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard">
                  <i className="fas fa-home"></i>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li
                className={activeTab === "profile" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/profile">
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </Link>
              </li>
              <li
                className={activeTab === "medical-records" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/medical-records">
                  <i className="fas fa-file-medical"></i>
                  <span>Medical Records</span>
                </Link>
              </li>
              <li
                className={activeTab === "reminders" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/reminders">
                  <i className="fas fa-bell"></i>
                  <span>Medicine Reminders</span>
                </Link>
              </li>
              <li
                className={activeTab === "bmi" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/bmi">
                  <i className="fas fa-weight"></i>
                  <span>BMI Calculator</span>
                </Link>
              </li>
              <li
                className={activeTab === "therapy" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/therapy">
                  <i className="fas fa-brain"></i>
                  <span>Health & Wellness</span>
                </Link>
              </li>
              <li
                className={activeTab === "refill" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/refill">
                  <i className="fas fa-capsules"></i>
                  <span>Medication Refill</span>
                </Link>
              </li>
              <li
                className={activeTab === "vitals" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/vitals">
                  <i className="fas fa-heartbeat"></i>
                  <span>Health Vitals</span>
                </Link>
              </li>
              <li
                className={activeTab === "guide" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/guide">
                  <i className="fas fa-book"></i>
                  <span>Your Guide</span>
                </Link>
              </li>
              <li
                className={activeTab === "feedback" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                <Link to="/dashboard/feedback">
                  <i className="fas fa-star"></i> Feedback
                </Link>
              </li>
              <li
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="logout-btn"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <div className="main-content">
        {/* Show welcome text only on desktop and only on dashboard home */}
        {userProfile && isDashboardHome && !isMobile && (
          <div className="dashboard-welcome-text">
            Welcome, {userProfile.firstName}!
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <DashboardHome
                userProfile={userProfile}
                bmiData={bmiData}
                healthFact={healthFact}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfileSection
                userProfile={userProfile}
                setUserProfile={setUserProfile}
              />
            }
          />
          <Route path="/medical-records" element={<MedicalRecordsSection />} />
          <Route path="/reminders" element={<MedicineRemindersSection />} />
          <Route
            path="/bmi"
            element={<BMICalculatorSection onBMICalculated={setBmiData} />}
          />
          <Route path="/therapy" element={<TherapySection />} />
          <Route path="/refill" element={<RefillReminders />} />
          <Route path="/vitals" element={<HealthVitalsTracker />} />
          <Route path="/guide" element={<YourGuide />} />
          <Route path="/feedback" element={<FeedbackSection />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;

// Dashboard Home Component
function DashboardHome({ userProfile, bmiData, healthFact }) {
  const [stats, setStats] = useState({
    documentCount: 0,
    todayReminderCount: 0,
    totalReminderCount: 0,
    criticalRefillCount: 0,
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const medicineReminders = userData?.medicineReminders || [];
            const refillReminders = userData?.refillReminders || [];
            const today = new Date();
            const currentTime = today.toTimeString().slice(0, 5);
            const currentDate = today.toISOString().split("T")[0];

            // Count medicine reminders due today
            const dueTodayCount = medicineReminders.filter((reminder) => {
              const reminderDate = reminder.startDate;
              const endDate = reminder.endDate;
              const reminderTime = reminder.time;
              const lastTakenDate = reminder.lastTaken
                ? new Date(reminder.lastTaken).toISOString().split("T")[0]
                : null;

              const isActive =
                (!endDate || endDate >= currentDate) &&
                reminderDate <= currentDate;
              const isDueToday =
                isActive &&
                reminderTime <= currentTime &&
                lastTakenDate !== currentDate;

              return isDueToday;
            }).length;

            // Count total active medicine reminders
            const totalActiveReminders = medicineReminders.filter(
              (reminder) => {
                const reminderDate = reminder.startDate;
                const endDate = reminder.endDate;
                return (
                  (!endDate || endDate >= currentDate) &&
                  reminderDate <= currentDate
                );
              }
            ).length;

            // Count critical refill reminders
            const criticalRefillCount = refillReminders.filter(
              (reminder) => getUrgencyLevel(reminder.refillDate) === "critical"
            ).length;

            setStats({
              documentCount: userData.medicalRecords?.length || 0,
              todayReminderCount: dueTodayCount,
              totalReminderCount: totalActiveReminders,
              criticalRefillCount: criticalRefillCount,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
        toast.error("Error loading user statistics");
      }
    };

    fetchUserStats();
  }, [userProfile]);

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
          <i className="fas fa-capsules"></i> {/* Changed icon for refill */}
          <h3>Critical Refill Reminders</h3> {/* Changed title */}
          <p>{stats.criticalRefillCount} medications</p> {/* Changed count */}
        </div>
        <div className="stat-card">
          <i className="fas fa-file-medical"></i>
          <h3>Medical Records</h3>
          <p>{stats.documentCount} documents</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-weight"></i>
          <h3>BMI Status</h3>
          <p>
            {bmiData
              ? `${bmiData.value} (${bmiData.category})`
              : "Not calculated"}
          </p>
        </div>
        <div className="stat-card">
          <i className="fas fa-bell"></i>
          <h3>Active Medicine Reminders</h3> {/* Clarified title */}
          <p>{stats.totalReminderCount} medications</p>
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
            {/* Added Critical Refill Reminders activity item */}
            {stats.criticalRefillCount > 0 && (
              <div className="activity-item">
                <i className="fas fa-capsules"></i> {/* Changed icon */}
                <span>Critical refill needed</span> {/* Changed text */}
                <small>{stats.criticalRefillCount} medications</small>{" "}
                {/* Changed count */}
              </div>
            )}
            {stats.totalReminderCount > 0 && (
              <div className="activity-item">
                <i className="fas fa-bell"></i>
                <span>Active medicine reminders</span> {/* Clarified text */}
                <small>{stats.totalReminderCount} medications</small>
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
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBMI] = useState(null);
  const [bmiCategory, setBMICategory] = useState("");

  const calculateBMI = async () => {
    if (age && weight && height) {
      // Convert height from cm to m
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBMI(bmiValue);

      // Determine BMI category
      let category;
      if (bmiValue < 18.5) {
        category = "Underweight";
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        category = "Normal weight";
      } else if (bmiValue >= 25 && bmiValue < 30) {
        category = "Overweight";
      } else {
        category = "Obese";
      }
      setBMICategory(category);

      // Save BMI data to Firestore
      const user = auth.currentUser;
      if (user) {
        const bmiData = {
          value: bmiValue,
          category: category,
          date: new Date().toISOString(),
        };
        await setDoc(
          doc(db, "Users", user.uid),
          {
            bmiData: bmiData,
          },
          { merge: true }
        );
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

function MedicineRemindersSection() {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    medicine: "",
    times: [""],
    dosage: "",
    frequency: "daily",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  });
  const [dueReminder, setDueReminder] = useState(null);
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const intervalRef = useRef();
  const audioRef = useRef(null);
  const lastCheckedTimeRef = useRef("");
  const notificationTimeoutRef = useRef(null);

  // Initialize audio and request notification permission
  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.load();

    // Request notification permission
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn("Could not play notification sound:", error);
      });
    }
  }, []);

  // Function to show reminder notification
  const showReminderNotification = useCallback(
    (reminder) => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      setDueReminder(reminder);
      playNotificationSound();

      if ("Notification" in window && notificationPermission === "granted") {
        const notification = new Notification("Time to Take Your Medicine!", {
          body: `Please take ${reminder.medicine} - ${reminder.dosage}`,
          icon: "/medicine-icon.png",
          requireInteraction: true,
          tag: `reminder-${reminder.id}`,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Play sound every 5 minutes until taken
      notificationTimeoutRef.current = setInterval(() => {
        playNotificationSound();
      }, 300000);
    },
    [notificationPermission, playNotificationSound]
  );

  // Check for due reminders
  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDate = now.toISOString().split("T")[0];

      if (currentTime !== lastCheckedTimeRef.current) {
        lastCheckedTimeRef.current = currentTime;

        const due = reminders.find((r) => {
          if (
            r.completed ||
            r.time !== currentTime ||
            (r.endDate && r.endDate < currentDate)
          ) {
            return false;
          }
          // Cooldown: skip if lastTaken is within the last 2 minutes
          if (r.lastTaken) {
            const lastTakenTime = new Date(r.lastTaken);
            if (!isNaN(lastTakenTime)) {
              const diffMs = now - lastTakenTime;
              if (diffMs < 2 * 60 * 1000) {
                return false;
              }
            }
          }
          // Also skip if lastTaken is today (existing logic)
          if (r.lastTaken && r.lastTaken.split("T")[0] === currentDate) {
            return false;
          }
          return true;
        });

        if (due) {
          showReminderNotification(due);
        }
      }
    };

    intervalRef.current = setInterval(checkDueReminders, 15000);
    checkDueReminders();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [reminders, showReminderNotification]);

  const markAsTaken = async (reminderId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const currentReminders = userData?.medicineReminders || [];

      const updatedReminders = currentReminders.map((reminder) => {
        if (reminder.id === reminderId) {
          const lastTakenDate = reminder.lastTaken
            ? reminder.lastTaken.split("T")[0]
            : null;
          const streak =
            lastTakenDate === currentDate
              ? reminder.streak
              : (reminder.streak || 0) + 1;

          return {
            ...reminder,
            completed: true,
            completedAt: now.toISOString(),
            lastTaken: now.toISOString(),
            streak,
          };
        }
        return reminder;
      });

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        medicineReminders: updatedReminders,
      });

      // Update both local states
      setReminders(updatedReminders);
      setDueReminder(null);

      if (notificationTimeoutRef.current) {
        clearInterval(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Show success message
      toast.success("Medication marked as taken!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
            const userReminders = userData.medicineReminders || [];
            const currentDate = new Date().toISOString().split("T")[0];
            const activeReminders = userReminders.filter(
              (reminder) => !reminder.endDate || reminder.endDate >= currentDate
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

  const addReminder = async () => {
    if (
      !newReminder.medicine ||
      !newReminder.dosage ||
      newReminder.times.some((time) => !time)
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated");
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
        notes: newReminder.notes || "",
        createdAt: new Date().toISOString(),
        completed: false,
        userId: user.uid,
        lastTaken: null,
        streak: 0, // Add streak counter
      }));

      // Get current reminders
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const currentReminders = userData?.medicineReminders || [];

      // Combine old and new reminders
      const updatedReminders = [...currentReminders, ...newReminders];

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        medicineReminders: updatedReminders,
      });

      // Update local state
      setReminders(updatedReminders);
      setNewReminder({
        medicine: "",
        times: [""],
        dosage: "",
        frequency: "daily",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: "",
      });

      toast.success("Reminder(s) added successfully!");
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast.error("Error adding reminder");
    }
  };

  const deleteReminder = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Get current reminders
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const currentReminders = userData?.medicineReminders || [];

      // Remove the reminder
      const updatedReminders = currentReminders.filter(
        (reminder) => reminder.id !== id
      );

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        medicineReminders: updatedReminders,
      });

      // Update local state
      setReminders(updatedReminders);
      toast.success("Reminder deleted successfully!");
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Error deleting reminder");
    }
  };

  return (
    <div className="reminders-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-pills"></i> Medicine Reminders
        </h2>
        <p className="section-description">
          Set up your medication schedule and never miss a dose
        </p>
      </div>

      <div className="reminders-container">
        <div className="add-reminder-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-plus-circle"></i> Add New Reminder
            </h3>
          </div>
          <div className="reminder-form">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <i className="fas fa-capsules"></i> Medicine Name
                </label>
                <input
                  type="text"
                  value={newReminder.medicine}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, medicine: e.target.value })
                  }
                  placeholder="Enter medicine name"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-sync"></i> How many times a day?
                </label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) => {
                    const frequency = e.target.value;
                    const times =
                      frequency === "daily"
                        ? [""]
                        : frequency === "twice"
                        ? ["", ""]
                        : ["", "", ""];
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
                <label>
                  <i className="fas fa-calendar"></i> Start Date
                </label>
                <input
                  type="date"
                  value={newReminder.startDate}
                  onChange={(e) =>
                    setNewReminder({
                      ...newReminder,
                      startDate: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-calendar-times"></i> End Date (Optional)
                </label>
                <input
                  type="date"
                  value={newReminder.endDate}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, endDate: e.target.value })
                  }
                  min={newReminder.startDate}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-balance-scale"></i> How much to take?
              </label>
              <input
                type="text"
                value={newReminder.dosage}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, dosage: e.target.value })
                }
                placeholder="Example: 1 tablet, 2 capsules, etc."
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>
                <i className="fas fa-sticky-note"></i> Special Instructions
                (Optional)
              </label>
              <textarea
                value={newReminder.notes}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, notes: e.target.value })
                }
                placeholder="Add any special instructions (e.g., take with food, after meals)"
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
                      <span>{dueReminder.time}</span>
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
            <h3>
              <i className="fas fa-list"></i> Your Reminders
            </h3>
            <span className="reminder-count">
              {reminders.length} active reminders
            </span>
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
                  className={`reminder-card ${
                    reminder.completed ? "completed" : ""
                  }`}
                >
                  <div className="reminder-header">
                    <h4>
                      <i className="fas fa-pills"></i> {reminder.medicine}
                    </h4>
                    <span
                      className={`status-badge ${
                        reminder.completed ? "completed" : "pending"
                      }`}
                    >
                      {reminder.completed ? "Taken" : "Pending"}
                    </span>
                  </div>

                  <div className="reminder-details">
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>{reminder.time}</span>
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

// Profile Section Component with improved UI and edit functionality
function ProfileSection({ userProfile, setUserProfile }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(userProfile || {});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Only update formData when userProfile changes and not in edit mode
  useEffect(() => {
    if (!editMode) setFormData(userProfile || {});
  }, [userProfile, editMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Validate phone number format (10 digits)
      if (!/^\d{10}$/.test(formData.phoneNumber)) {
        throw new Error("Phone number must be exactly 10 digits");
      }

      // Validate caretaker phone number format (10 digits)
      if (formData.caretakerPhone && !/^\d{10}$/.test(formData.caretakerPhone)) {
        throw new Error("Caretaker phone number must be exactly 10 digits");
      }

      // Validate first name and last name (not numbers only)
      if (/^\d+$/.test(formData.firstName)) {
        throw new Error("First name cannot contain only numbers");
      }
      if (/^\d+$/.test(formData.lastName)) {
        throw new Error("Last name cannot contain only numbers");
      }

      // Validate email format if caretaker email is provided
      if (formData.caretakerEmail && !isValidEmail(formData.caretakerEmail)) {
        throw new Error("Please enter a valid caretaker email address");
      }

      // Create the update object with only the fields that can be edited
      const updateData = {
        ...userProfile, // Preserve existing data
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        caretakerPhone: formData.caretakerPhone,
        caretakerEmail: formData.caretakerEmail,
      };

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), updateData);

      // Update local state
      setUserProfile(updateData);
      setSuccess("Profile updated successfully!");
      setEditMode(false);

      // Show success toast
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile: " + err.message);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Add email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="section profile-section">
      <div className="profile-header-banner" style={{ position: "relative" }}>
        <div className="profile-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <h2>Profile Information</h2>
        {!editMode && userProfile && (
          <button
            className="edit-profile-btn"
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(52,152,219,0.15)",
              cursor: "pointer",
              fontSize: 22,
              zIndex: 2,
              transition: "background 0.2s",
            }}
            title="Edit Profile"
            onClick={() => setEditMode(true)}
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
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
                  <label>
                    <i className="fas fa-user-tag"></i> Full Name
                  </label>
                  {editMode ? (
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleChange}
                        placeholder="First Name"
                        className="form-control"
                        style={{ maxWidth: "150px" }}
                        required
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        placeholder="Last Name"
                        className="form-control"
                        style={{ maxWidth: "150px" }}
                        required
                      />
                    </div>
                  ) : (
                    <p>{`${userProfile.firstName} ${userProfile.lastName}`}</p>
                  )}
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fas fa-envelope"></i> Email
                  </label>
                  <p>{userProfile.email}</p>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fas fa-calendar-alt"></i> Date of Birth
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  ) : (
                    <p>
                      {new Date(userProfile.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
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
                  <label>
                    <i className="fas fa-phone"></i> Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  ) : (
                    <p>{userProfile.phoneNumber}</p>
                  )}
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fas fa-user-shield"></i> Caretaker's Phone
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="caretakerPhone"
                      value={formData.caretakerPhone || ""}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  ) : (
                    <p>{userProfile.caretakerPhone}</p>
                  )}
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fas fa-envelope"></i> Caretaker's Email
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      name="caretakerEmail"
                      value={formData.caretakerEmail || ""}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter caretaker's email"
                    />
                  ) : (
                    <p>{userProfile.caretakerEmail || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {editMode && (
            <div style={{ marginTop: 30, textAlign: "center" }}>
              <button
                className="btn btn-success"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-save"></i>
                )}{" "}
                Save
              </button>
              <button
                className="btn btn-secondary"
                style={{ marginLeft: 15 }}
                onClick={() => {
                  setEditMode(false);
                  setFormData(userProfile);
                }}
              >
                Cancel
              </button>
            </div>
          )}
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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const healthVideos = [
    {
      id: 1,
      title: "Understanding Mental Health",
      description:
        "A comprehensive guide to understanding mental health and well-being.",
      thumbnail: "https://img.youtube.com/vi/wOGqlVqyvCM/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/wOGqlVqyvCM",
      category: "Mental Health",
    },
    {
      id: 2,
      title: "Mental Health Awareness",
      description:
        "Important information about mental health awareness and support.",
      thumbnail: "https://img.youtube.com/vi/C2dum954yIg/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/C2dum954yIg",
      category: "Mental Health",
    },
    {
      id: 3,
      title: "Nutrition Basics",
      description: "Essential guide to understanding nutrition fundamentals.",
      thumbnail: "https://img.youtube.com/vi/-e-4Kx5px_I/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/-e-4Kx5px_I",
      category: "Nutrition",
    },
    {
      id: 4,
      title: "Healthy Eating Habits",
      description:
        "Learn about maintaining healthy eating habits for better nutrition.",
      thumbnail: "https://img.youtube.com/vi/c06dTj0v0sM/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/c06dTj0v0sM",
      category: "Nutrition",
    },
    {
      id: 5,
      title: "Balanced Diet Guide",
      description:
        "Comprehensive guide to creating and maintaining a balanced diet.",
      thumbnail: "https://img.youtube.com/vi/YAmzlo5pbN8/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/YAmzlo5pbN8",
      category: "Nutrition",
    },

    {
      id: 12,
      title: "Proper Handwashing",
      description:
        "Learn the correct way to wash your hands to prevent the spread of germs.",
      thumbnail: "https://img.youtube.com/vi/UxskKQ9WOTE/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/UxskKQ9WOTE",
      category: "Health and Hygiene",
    },
    {
      id: 13,
      title: "Dental Hygiene Tips",
      description: "Essential tips for maintaining good oral health.",
      thumbnail: "https://img.youtube.com/vi/zh7CACofsio/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/zh7CACofsio",
      category: "Health and Hygiene",
    },
    {
      id: 14,
      title: "Importance of Sleep",
      description:
        "Understanding why sleep is crucial for your health and well-being.",
      thumbnail: "https://img.youtube.com/vi/In_sGALiccs/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/In_sGALiccs",
      category: "Health and Hygiene",
    },
    {
      id: 15,
      title: "Importance of Physical Activity",
      description:
        "Understand the importance of physical activity for overall health.",
      thumbnail: "https://img.youtube.com/vi/D411IY14pCI/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/D411IY14pCI",
      category: "Health and Hygiene",
    },
    {
      id: 16,
      title: "Understanding Vaccinations",
      description:
        "Learn about the importance of vaccinations for preventing diseases.",
      thumbnail: "https://img.youtube.com/vi/12Lwmd_Dq4c/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/12Lwmd_Dq4c",
      category: "Health and Hygiene",
    },
    {
      id: 17,
      title: "Sun Safety",
      description: "Tips for protecting your skin from the sun's harmful rays.",
      thumbnail: "https://img.youtube.com/vi/3PmVJQUCm4E/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/3PmVJQUCm4E",
      category: "Health and Hygiene",
    },
    {
      id: 18,
      title: "Managing Stress",
      description:
        "Effective techniques for managing stress in your daily life.",
      thumbnail: "https://img.youtube.com/vi/01COSszay_g/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/01COSszay_g",
      category: "Health and Hygiene",
    },
    {
      id: 19,
      title: "Basic First Aid",
      description: "Learn essential first aid skills for common injuries.",
      thumbnail: "https://img.youtube.com/vi/OdRM9chZHaY/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/OdRM9chZHaY",
      category: "Health and Hygiene",
    },
    {
      id: 20,
      title: "Healthy Living Habits",
      description: "Simple habits for a healthier lifestyle.",
      thumbnail: "https://img.youtube.com/vi/jLmN0ts0k4o/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/jLmN0ts0k4o",
      category: "Health and Hygiene",
    },
    {
      id: 21,
      title: "Boosting Immunity",
      description: "Tips and strategies for strengthening your immune system.",
      thumbnail: "https://img.youtube.com/vi/XVYn2AoSneA/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/XVYn2AoSneA",
      category: "Health and Hygiene",
    },
    {
      id: 22,
      title: "Beginner Full Body Workout",
      description: "A simple full body workout routine for beginners.",
      thumbnail: "https://img.youtube.com/vi/-_VhU5rqyko/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/-_VhU5rqyko",
      category: "Fitness",
    },
    {
      id: 23,
      title: "Morning Yoga Routine",
      description: "A gentle yoga routine to start your day.",
      thumbnail: "https://img.youtube.com/vi/h2KGe11oyEI/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/h2KGe11oyEI",
      category: "Fitness",
    },
    {
      id: 25,
      title: "Strength Training Basics",
      description: "Fundamental strength training exercises.",
      thumbnail: "https://img.youtube.com/vi/d737O-vv5TY/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/d737O-vv5TY",
      category: "Fitness",
    },
    {
      id: 26,
      title: "Flexibility Exercises",
      description: "Exercises to improve your flexibility.",
      thumbnail: "https://img.youtube.com/vi/x6wiDew4sYU/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/x6wiDew4sYU",
      category: "Fitness",
    },
    {
      id: 27,
      title: "High-Intensity Interval Training (HIIT)",
      description: "An intense HIIT workout routine.",
      thumbnail: "https://img.youtube.com/vi/Wa8Fk8TaXPk/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/Wa8Fk8TaXPk",
      category: "Fitness",
    },
    {
      id: 28,
      title: "Workout Motivation",
      description: "Tips and inspiration to stay motivated with your workouts.",
      thumbnail: "https://img.youtube.com/vi/IL3E0SGEWl0/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/IL3E0SGEWl0",
      category: "Fitness",
    },
    {
      id: 29,
      title: "Post-Workout Stretching",
      description: "Stretches to do after your workout.",
      thumbnail: "https://img.youtube.com/vi/aX5FP3odWL4/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/aX5FP3odWL4",
      category: "Fitness",
    },
  ];

  const categories = [
    "All",
    ...new Set(healthVideos.map((video) => video.category)),
  ];

  const filteredVideos =
    selectedCategory === "All"
      ? healthVideos
      : healthVideos.filter((video) => video.category === selectedCategory);

  return (
    <div className="section therapy-section" style={{ padding: "20px" }}>
      <div className="section-header" style={{ marginBottom: "30px" }}>
        <h2>
          <i className="fas fa-brain"></i> Health & Wellness Resources
        </h2>
        <p className="section-description">
          Access helpful videos and resources to support your health and
          well-being
        </p>
      </div>

      <div className="category-filter" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                background:
                  selectedCategory === category ? "#2563eb" : "#f3f4f6",
                color: selectedCategory === category ? "white" : "#374151",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div
        className="videos-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="video-card"
            style={{
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => setSelectedVideo(video)}
          >
            <div
              className="video-thumbnail"
              style={{ position: "relative", paddingTop: "56.25%" }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                className="play-button"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0,0,0,0.7)",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fas fa-play"
                  style={{ color: "white", fontSize: "24px" }}
                ></i>
              </div>
            </div>
            <div className="video-info" style={{ padding: "15px" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  background: "#e5e7eb",
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              >
                {video.category}
              </div>
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "18px",
                  color: "#333",
                }}
              >
                {video.title}
              </h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div
          className="video-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="video-container"
            style={{
              width: "90%",
              maxWidth: "800px",
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              className="video-header"
              style={{
                padding: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
              }}
            >
              <h3 style={{ margin: 0 }}>{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div
              className="video-frame"
              style={{ position: "relative", paddingTop: "56.25%" }}
            >
              <iframe
                src={selectedVideo.url}
                title={selectedVideo.title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Medical Records Section Component
function MedicalRecordsSection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [records, setRecords] = useState([]);
  const [recordType, setRecordType] = useState("prescription");
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
          const sortedRecords = [...userData.medicalRecords].sort(
            (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
          );
          setRecords(sortedRecords);
        }
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Error loading medical records");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only JPG, PNG, or PDF files");
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setUploadStatus(null);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "ml_default");

      // Add user-specific folder
      const user = auth.currentUser;
      if (user) {
        formData.append("folder", `users/${user.uid}/medical-records`);
      }

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        // Save record to Firestore
        const record = {
          url: data.secure_url,
          uploadDate: new Date().toISOString(),
          type: recordType,
          userId: user.uid,
        };

        // Update user's medical records array
        await updateDoc(doc(db, "users", user.uid), {
          medicalRecords: arrayUnion(record),
        });

        setRecords([...records, record]);
        setUploadStatus("uploaded");
        setSelectedFile(null);
        setPreviewUrl(null);
        toast.success("Medical record uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading record:", error);
      toast.error("Error uploading medical record");
      setUploadStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordUrl) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Get current records
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const currentRecords = userData?.medicalRecords || [];

      // Remove the record from the array
      const updatedRecords = currentRecords.filter(
        (record) => record.url !== recordUrl
      );

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        medicalRecords: updatedRecords,
      });

      // Update local state
      setRecords(updatedRecords);
      toast.success("Medical record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Error deleting medical record");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "70vh",
        background: "#f4f7fb",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 8px 32px rgba(60,60,120,0.10)",
          padding: "36px 32px",
          maxWidth: "700px",
          width: "100%",
          margin: "0 16px",
          transition: "box-shadow 0.2s",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 28 }}
        >
          <i
            className="fas fa-file-medical"
            style={{ fontSize: 28, color: "#2563eb", marginRight: 14 }}
          ></i>
          <h2
            style={{ fontWeight: 700, fontSize: 26, margin: 0, color: "#222" }}
          >
            Medical Records
          </h2>
        </div>
        <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 16 }}>
          Upload and manage your medical documents
        </p>

        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          {/* Record Type */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <label
              style={{
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
                display: "block",
                fontSize: 15,
              }}
            >
              <i
                className="fas fa-notes-medical"
                style={{ color: "#2563eb", marginRight: 7 }}
              ></i>
              Type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                fontSize: 15,
                background: "#f9fafb",
                fontWeight: 500,
                outline: "none",
                transition: "border 0.2s",
              }}
            >
              <option value="prescription">Prescription</option>
              <option value="lab-report">Lab Report</option>
              <option value="xray">X-Ray</option>
              <option value="mri">MRI Scan</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* File Input */}
          <div style={{ flex: 2, minWidth: 220 }}>
            <label
              style={{
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
                display: "block",
                fontSize: 15,
              }}
            >
              <i
                className="fas fa-file-upload"
                style={{ color: "#2563eb", marginRight: 7 }}
              ></i>
              File
            </label>
            <div
              style={{
                border: "2px dashed #c7d2fe",
                borderRadius: 10,
                background: "#f1f5f9",
                padding: "18px 12px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border 0.2s",
                minHeight: 70,
                position: "relative",
              }}
              onClick={() =>
                document.getElementById("file-upload-input").click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.border = "2px solid #2563eb";
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.border = "2px dashed #c7d2fe";
              }}
              onDrop={(e) => {
                e.preventDefault();
                setSelectedFile(e.dataTransfer.files[0]);
                e.currentTarget.style.border = "2px dashed #c7d2fe";
              }}
            >
              <input
                id="file-upload-input"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: "none" }}
              />
              <span style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>
                {selectedFile
                  ? selectedFile.name
                  : "Drag & drop or click to select file"}
              </span>
              <small
                style={{
                  display: "block",
                  color: "#6b7280",
                  marginTop: 6,
                  fontSize: 13,
                }}
              >
                Max 5MB. JPG, PNG, PDF only.
              </small>
            </div>
          </div>

          {/* Preview */}
          <div style={{ flex: 1.2, minWidth: 180 }}>
            <label
              style={{
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
                display: "block",
                fontSize: 15,
              }}
            >
              <i
                className="fas fa-eye"
                style={{ color: "#2563eb", marginRight: 7 }}
              ></i>
              Preview
            </label>
            <div
              style={{
                background: "#f9fafb",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                minHeight: 70,
                height: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(60,60,120,0.04)",
              }}
            >
              {previewUrl ? (
                selectedFile?.type === "application/pdf" ? (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      borderRadius: 8,
                      objectFit: "contain",
                    }}
                  />
                )
              ) : (
                <span style={{ color: "#9ca3af", fontSize: 14 }}>
                  No file selected
                </span>
              )}
            </div>
          </div>
        </div>

        {uploadStatus === "uploading" && (
          <div style={{ marginBottom: 18 }}>
            <div className="progress" style={{ height: 8, borderRadius: 5 }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${uploadProgress}%`,
                  transition: "width 0.3s",
                  background: "#2563eb",
                }}
                aria-valuenow={uploadProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {uploadProgress}%
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="btn btn-primary"
            style={{
              padding: "13px 38px",
              fontSize: "1.1rem",
              borderRadius: "8px",
              fontWeight: 600,
              background: "#2563eb",
              border: "none",
              boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
              transition: "background 0.2s",
              minWidth: "200px",
              letterSpacing: "0.5px",
            }}
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

        {/* Records List - keep previous design for now */}
        <div className="records-list" style={{ marginTop: "40px" }}>
          <div
            className="list-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <h3>
              <i className="fas fa-list"></i> Your Records
            </h3>
            <span
              className="record-count"
              style={{
                backgroundColor: "#e9ecef",
                padding: "5px 15px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                color: "#495057",
              }}
            >
              {records.length} records
            </span>
          </div>

          {isLoadingRecords ? (
            <div
              className="loading-records"
              style={{
                textAlign: "center",
                padding: "40px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <i
                className="fas fa-spinner fa-spin"
                style={{ fontSize: "2rem", color: "#6c757d" }}
              ></i>
              <p style={{ marginTop: "15px", color: "#6c757d" }}>
                Loading records...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div
              className="no-records"
              style={{
                textAlign: "center",
                padding: "40px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <i
                className="fas fa-file-medical"
                style={{ fontSize: "3rem", color: "#6c757d" }}
              ></i>
              <p style={{ marginTop: "15px", color: "#6c757d" }}>
                No medical records found. Upload your first record above!
              </p>
            </div>
          ) : (
            <div
              className="records-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {records.map((record, index) => (
                <div
                  key={index}
                  className="record-card"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <div
                    className="record-preview"
                    style={{ height: "200px", overflow: "hidden" }}
                  >
                    {record.url.endsWith(".pdf") ? (
                      <div
                        className="pdf-preview"
                        style={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <i
                          className="fas fa-file-pdf"
                          style={{ fontSize: "3rem", color: "#dc3545" }}
                        ></i>
                        <span style={{ marginTop: "10px", color: "#495057" }}>
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <img
                        src={record.url}
                        alt="Record"
                        className="record-image"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div className="record-info" style={{ padding: "15px" }}>
                    <div
                      className="record-type"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <i
                        className="fas fa-tag"
                        style={{ color: "#6c757d", marginRight: "8px" }}
                      ></i>
                      <span
                        style={{
                          textTransform: "capitalize",
                          color: "#495057",
                          fontWeight: "500",
                        }}
                      >
                        {record.type}
                      </span>
                    </div>
                    <div
                      className="record-date"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#6c757d",
                        fontSize: "0.9rem",
                      }}
                    >
                      <i
                        className="fas fa-calendar"
                        style={{ marginRight: "8px" }}
                      ></i>
                      <span>
                        {new Date(record.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div
                    className="record-actions"
                    style={{
                      padding: "15px",
                      borderTop: "1px solid #e9ecef",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    {record.url.endsWith('.pdf') ? (
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => downloadPdfFromUrl(record.url, `record-${index + 1}.pdf`)}
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                    ) : (
                      <a
                        href={record.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        <i className="fas fa-eye"></i> View
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteRecord(record.url)}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
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

const CARD_STYLE = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 2px 12px rgba(60,60,120,0.07)",
  padding: 24,
  marginBottom: 18,
  flex: 1,
  minWidth: 220,
  maxWidth: 340,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "stretch",
};

// Create a new FeedbackSection component
const FeedbackSection = () => (
  <div style={{ margin: '60px auto 0 auto', maxWidth: 700, background: 'linear-gradient(135deg, #f8fafc 0%, #e0f7fa 100%)', borderRadius: 24, boxShadow: '0 8px 32px rgba(44,62,80,0.10)', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative' }}>
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
        <span style={{ fontSize: 36, color: '#FFD600' }}>&#9733;</span>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2c3e50', margin: 0 }}>
          Feedback & Ratings
        </h2>
        <span style={{ fontSize: 36, color: '#FFD600' }}>&#9733;</span>
      </div>
      <p style={{ color: '#4a5568', fontSize: '1.15rem', margin: 0 }}>
        We care about your experience! Please rate our service and share your thoughts. Your feedback helps us improve and serve you better.
      </p>
    </div>
    <Feedback />
  </div>
);
