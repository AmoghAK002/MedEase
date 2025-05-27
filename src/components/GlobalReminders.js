import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

function GlobalReminders() {
  const [dueReminders, setDueReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastCheckedTimeRef = useRef('');

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        const reminders = data?.medicineReminders || [];
        console.log("All reminders:", reminders);

        const today = new Date();
        const currentTime = today.toTimeString().slice(0, 5);
        const currentDate = today.toISOString().split('T')[0];
        console.log("Current time:", currentTime);
        console.log("Current date:", currentDate);

        // Only check if the time has changed
        if (currentTime !== lastCheckedTimeRef.current) {
          lastCheckedTimeRef.current = currentTime;

          // Filter reminders that are due now
          const due = reminders.filter(rem => {
            const isDue = !rem.completed && 
              rem.time === currentTime &&
              (!rem.endDate || rem.endDate >= currentDate) &&
              (!rem.lastTaken || rem.lastTaken.split('T')[0] !== currentDate);
            
            console.log("Checking reminder:", rem);
            console.log("Is due:", isDue);
            return isDue;
          });

          console.log("Due reminders:", due);
          setDueReminders(due);
        }
      } catch (error) {
        console.error("Error fetching reminders:", error);
        toast.error("Error loading reminders");
      } finally {
        setLoading(false);
      }
    };

    // Check for reminders every minute
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000);

    return () => clearInterval(interval);
  }, []);

  const markAsTaken = async (reminderId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const data = userDoc.data();
      const reminders = data?.medicineReminders || [];

      const updatedReminders = reminders.map(rem => {
        if (rem.id === reminderId) {
          const now = new Date();
          const currentDate = now.toISOString().split('T')[0];
          const lastTakenDate = rem.lastTaken ? rem.lastTaken.split('T')[0] : null;
          const streak = lastTakenDate === currentDate ? rem.streak : (rem.streak || 0) + 1;
          
          return {
            ...rem,
            completed: true,
            completedAt: now.toISOString(),
            lastTaken: now.toISOString(),
            streak
          };
        }
        return rem;
      });

      await updateDoc(doc(db, "users", user.uid), {
        medicineReminders: updatedReminders
      });

      setDueReminders(prev => prev.filter(rem => rem.id !== reminderId));
      toast.success("Medication marked as taken!");
    } catch (error) {
      console.error("Error marking reminder as taken:", error);
      toast.error("Error updating reminder status");
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {dueReminders.map(reminder => (
        <div key={reminder.id} className="reminder-modal-overlay">
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
                    <h4>{reminder.medicine}</h4>
                  </div>
                  <div className="info-item dosage">
                    <i className="fas fa-balance-scale"></i>
                    <h4>{reminder.dosage}</h4>
                  </div>
                  <div className="info-item time">
                    <i className="fas fa-clock"></i>
                    <span>{reminder.time}</span>
                  </div>
                  {reminder.notes && (
                    <div className="info-item notes">
                      <i className="fas fa-sticky-note"></i>
                      <span>{reminder.notes}</span>
                    </div>
                  )}
                </div>
                <div className="reminder-actions">
                  <button 
                    onClick={() => markAsTaken(reminder.id)}
                    className="btn btn-success mark-taken-btn"
                  >
                    <i className="fas fa-check"></i> TABLET TAKEN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default GlobalReminders; 