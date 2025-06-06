import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CaretakerDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          navigate("/login");
          return;
        }

        const userData = userDoc.data();
        if (userData.role !== "caretaker") {
          navigate("/dashboard");
          return;
        }

        // Fetch all patients who have this caretaker's email
        const patientsQuery = await getDocs(collection(db, "users"));
        const assignedPatients = [];
        
        patientsQuery.forEach((doc) => {
          const patientData = doc.data();
          if (patientData.caretakerEmail === user.email) {
            assignedPatients.push({
              id: doc.id,
              ...patientData
            });
          }
        });

        setPatients(assignedPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Error loading patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [navigate]);

  const markReminderAsTaken = async (patientId, reminderId) => {
    try {
      const patientDoc = await getDoc(doc(db, "users", patientId));
      if (!patientDoc.exists()) return;

      const patientData = patientDoc.data();
      const reminders = patientData.medicineReminders || [];
      
      const updatedReminders = reminders.map(reminder => {
        if (reminder.id === reminderId) {
          return {
            ...reminder,
            completed: true,
            completedAt: new Date().toISOString(),
            lastTaken: new Date().toISOString(),
            takenBy: auth.currentUser.email
          };
        }
        return reminder;
      });

      await updateDoc(doc(db, "users", patientId), {
        medicineReminders: updatedReminders
      });

      // Update local state
      setPatients(prevPatients => 
        prevPatients.map(patient => {
          if (patient.id === patientId) {
            return {
              ...patient,
              medicineReminders: updatedReminders
            };
          }
          return patient;
        })
      );

      toast.success("Reminder marked as taken");
    } catch (error) {
      console.error("Error marking reminder as taken:", error);
      toast.error("Error updating reminder");
    }
  };

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
    <div className="caretaker-dashboard">
      <div className="section-header">
        <h2>
          <i className="fas fa-user-nurse"></i> Caretaker Dashboard
        </h2>
        <p className="section-description">
          Manage and monitor your patients' medication schedules
        </p>
      </div>

      {patients.length === 0 ? (
        <div className="no-patients">
          <i className="fas fa-user-friends"></i>
          <p>No patients assigned yet. Patients can add you as their caretaker through their profile settings.</p>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map(patient => (
            <div key={patient.id} className="patient-card">
              <div className="patient-header">
                <h3>
                  <i className="fas fa-user"></i> {patient.firstName} {patient.lastName}
                </h3>
                <span className="patient-email">{patient.email}</span>
              </div>

              <div className="reminders-section">
                <h4>
                  <i className="fas fa-pills"></i> Medication Schedule
                </h4>
                {patient.medicineReminders?.length === 0 ? (
                  <p className="no-reminders">No active reminders</p>
                ) : (
                  <div className="reminders-list">
                    {patient.medicineReminders?.map(reminder => (
                      <div key={reminder.id} className={`reminder-item ${reminder.completed ? 'completed' : ''}`}>
                        <div className="reminder-info">
                          <h5>{reminder.medicine}</h5>
                          <p>
                            <i className="fas fa-clock"></i> {reminder.time}
                          </p>
                          <p>
                            <i className="fas fa-balance-scale"></i> {reminder.dosage}
                          </p>
                          {reminder.notes && (
                            <p className="reminder-notes">
                              <i className="fas fa-sticky-note"></i> {reminder.notes}
                            </p>
                          )}
                        </div>
                        {!reminder.completed && (
                          <button
                            onClick={() => markReminderAsTaken(patient.id, reminder.id)}
                            className="btn btn-success mark-taken-btn"
                          >
                            <i className="fas fa-check"></i> Mark as Taken
                          </button>
                        )}
                        {reminder.completed && (
                          <span className="taken-badge">
                            <i className="fas fa-check-circle"></i> Taken
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CaretakerDashboard; 