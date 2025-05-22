import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const DAYS_BEFORE_REFILL = 3; // Alert 3 days before end

function RefillReminders() {
  const [refillMeds, setRefillMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReminders() {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const data = userDoc.data();
      const reminders = data?.medicineReminders || [];
      const today = new Date();
      const soon = reminders.filter(rem => {
        if (!rem.endDate) return false;
        const end = new Date(rem.endDate);
        const diff = (end - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= DAYS_BEFORE_REFILL;
      });
      setRefillMeds(soon);
      setLoading(false);
    }
    fetchReminders();
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(60,60,120,0.07)",
        padding: 24,
        margin: "32px 0",
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h2 style={{ fontSize: 22, color: "#d32f2f", marginBottom: 16 }}>
        <i className="fas fa-capsules" style={{ marginRight: 10 }}></i>
        Medication Refill Reminders
      </h2>
      {loading ? (
        <div style={{ color: "#888" }}>Loading...</div>
      ) : refillMeds.length === 0 ? (
        <div style={{ color: "#388e3c", fontWeight: 600 }}>
          No medications need refilling soon.
        </div>
      ) : (
        <ul style={{ fontSize: 18, color: "#222", paddingLeft: 20 }}>
          {refillMeds.map((med, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              <b>{med.medicine}</b> will run out on{" "}
              <span style={{ color: "#d32f2f" }}>
                {new Date(med.endDate).toLocaleDateString()}
              </span>
              . Please plan a refill!
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RefillReminders; 