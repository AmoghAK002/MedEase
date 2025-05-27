import React, { useEffect, useState } from "react";
import { auth, db, COLLECTIONS } from "../firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";

const DAYS_BEFORE_REFILL = 3; // Alert 3 days before end

function RefillReminders() {
  const [refillMeds, setRefillMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [newRefill, setNewRefill] = useState({
    medicine: '',
    currentQuantity: '',
    dailyDosage: '',
    refillQuantity: '',
    pharmacy: '',
    notes: ''
  });
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'refilled'
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency', 'name', 'date'

  // Fetch user profile and set up real-time listeners
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);

    // Set up real-time listener for refill reminders
    const remindersUnsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          let reminders = data?.refillReminders || [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let updatedReminders = [];
          let needFirestoreUpdate = false;

          for (const rem of reminders) {
            if (!rem.dailyDosage || !rem.currentQuantity || (!rem.lastRefilled && !rem.createdAt)) {
              updatedReminders.push(rem);
              continue;
            }

            const dailyDosage = parseInt(rem.dailyDosage);
            let currentQuantity = parseInt(rem.currentQuantity);

            if (isNaN(dailyDosage) || dailyDosage <= 0 || isNaN(currentQuantity)) {
              updatedReminders.push(rem);
              continue;
            }

            const lastUpdateDate = rem.lastRefilled ? new Date(rem.lastRefilled) : new Date(rem.createdAt);
            lastUpdateDate.setHours(0, 0, 0, 0);

            const timeDiff = today.getTime() - lastUpdateDate.getTime();
            const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

            if (daysPassed > 0) {
              const dosageConsumed = daysPassed * dailyDosage;
              const newQuantity = Math.max(0, currentQuantity - dosageConsumed);

              let newRefillDate = null;
              if (newQuantity > 0 && dailyDosage > 0) {
                const daysRemaining = Math.floor(newQuantity / dailyDosage);
                const date = new Date(today);
                date.setDate(today.getDate() + daysRemaining);
                newRefillDate = date.toISOString().split('T')[0];
              }

              updatedReminders.push({
                ...rem,
                currentQuantity: newQuantity,
                refillDate: newRefillDate,
                lastRefilled: new Date().toISOString(),
                lastDosageCalculationDate: new Date().toISOString()
              });
              needFirestoreUpdate = true;
            } else {
              updatedReminders.push(rem);
            }
          }

          if (needFirestoreUpdate) {
            try {
              await updateDoc(userDocRef, {
                refillReminders: updatedReminders
              });
              console.log("Firestore reminders updated successfully!");
            } catch (error) {
              console.error("Error updating Firestore reminders:", error);
              toast.error("Error updating medication quantities");
            }
          }

          // Apply filters
          let filteredReminders = updatedReminders;
          switch (filter) {
            case 'active':
              filteredReminders = updatedReminders.filter(rem => rem.currentQuantity > 0);
              break;
            case 'refilled':
              filteredReminders = updatedReminders.filter(rem => rem.currentQuantity <= 0);
              break;
            default:
              filteredReminders = updatedReminders;
          }

          // Apply sorting
          switch (sortBy) {
            case 'name':
              filteredReminders.sort((a, b) => a.medicine.localeCompare(b.medicine));
              break;
            case 'date':
              filteredReminders.sort((a, b) => {
                if (!a.refillDate || !b.refillDate) return 0;
                return new Date(a.refillDate) - new Date(b.refillDate);
              });
              break;
            default: // 'urgency'
              filteredReminders.sort((a, b) => {
                const urgencyA = getUrgencyLevel(a.refillDate);
                const urgencyB = getUrgencyLevel(b.refillDate);
                const urgencyOrder = { critical: 0, urgent: 1, warning: 2, low: 3 };
                return urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
              });
          }

          setRefillMeds(filteredReminders);
        } else {
          setRefillMeds([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching refill reminders:", error);
        toast.error("Error loading refill reminders");
        setLoading(false);
      }
    );

    return () => {
      remindersUnsubscribe();
    };
  }, [filter, sortBy]);

  const calculateRefillDate = (quantity, dailyDosage) => {
    if (!quantity || !dailyDosage || dailyDosage <= 0) return null;
    const daysUntilRefill = Math.floor(quantity / dailyDosage);
    const refillDate = new Date();
    refillDate.setDate(refillDate.getDate() + daysUntilRefill);
    return refillDate.toISOString().split('T')[0];
  };

  const addRefillReminder = async () => {
    // Validate required fields
    if (!newRefill.medicine || !newRefill.currentQuantity || !newRefill.dailyDosage) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate numeric values
    const currentQuantity = parseInt(newRefill.currentQuantity);
    const dailyDosage = parseInt(newRefill.dailyDosage);
    const refillQuantity = parseInt(newRefill.refillQuantity) || currentQuantity;

    if (isNaN(currentQuantity) || isNaN(dailyDosage) || isNaN(refillQuantity)) {
      toast.error('Please enter valid numbers for quantities and dosage');
      return;
    }

    if (currentQuantity < 0 || dailyDosage <= 0 || refillQuantity < 0) {
      toast.error('Daily dosage must be greater than 0. Quantities cannot be negative.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const refillDate = calculateRefillDate(currentQuantity, dailyDosage);

      const newReminder = {
        id: Date.now(),
        medicine: newRefill.medicine.trim(),
        currentQuantity: currentQuantity,
        dailyDosage: dailyDosage,
        refillQuantity: refillQuantity,
        refillDate: refillDate,
        pharmacy: newRefill.pharmacy.trim() || 'Not specified',
        notes: newRefill.notes.trim() || '',
        createdAt: new Date().toISOString(),
        lastRefilled: null,
        lastDosageCalculationDate: new Date().toISOString(),
        userId: user.uid // Add user ID for better data organization
      };

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const currentReminders = userData?.refillReminders || [];

      // Check for duplicate medicine among active reminders
      const isDuplicate = currentReminders.some(rem =>
        rem.medicine.toLowerCase() === newReminder.medicine.toLowerCase() &&
        (rem.currentQuantity > 0 || (rem.refillDate && new Date(rem.refillDate) >= new Date()))
      );

      if (isDuplicate) {
        toast.error('A reminder for this medicine already exists or is active.');
        return;
      }

      // Add new reminder
      const updatedReminders = [...currentReminders, newReminder];

      // Update Firestore
      await updateDoc(userDocRef, {
        refillReminders: updatedReminders
      });

      // Reset form
      setNewRefill({
        medicine: '',
        currentQuantity: '',
        dailyDosage: '',
        refillQuantity: '',
        pharmacy: '',
        notes: ''
      });
      setShowAddForm(false);

      toast.success('Refill reminder added successfully!');
    } catch (error) {
      console.error("Error adding refill reminder:", error);
      toast.error("Error adding refill reminder. Please try again.");
    }
  };

  const handleMarkAsRefilled = (med) => {
    setSelectedMed(med);
    setShowConfirmDialog(true);
  };

  const markAsRefilled = async () => {
    if (!selectedMed) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      const data = userDoc.data();
      const reminders = data?.refillReminders || [];

      let updatedReminders = [];
      let updatedReminder = null;

      for (const rem of reminders) {
        if (rem.id === selectedMed.id) {
          const dailyDosage = parseInt(rem.dailyDosage);
          const refillQuantity = parseInt(rem.refillQuantity);

          if (isNaN(dailyDosage) || dailyDosage <= 0 || isNaN(refillQuantity) || refillQuantity < 0) {
            console.error("Invalid dosage or refill quantity for marking as refilled", rem);
            updatedReminders.push(rem);
            continue;
          }

          let newRefillDate = null;
          if (refillQuantity > 0 && dailyDosage > 0) {
            const daysRemaining = Math.floor(refillQuantity / dailyDosage);
            const date = new Date();
            date.setDate(date.getDate() + daysRemaining);
            newRefillDate = date.toISOString().split('T')[0];
          }

          updatedReminder = {
            ...rem,
            currentQuantity: refillQuantity,
            refillDate: newRefillDate,
            lastRefilled: new Date().toISOString(),
            lastDosageCalculationDate: new Date().toISOString()
          };
          updatedReminders.push(updatedReminder);
        } else {
          updatedReminders.push(rem);
        }
      }

      if (updatedReminder) {
        await updateDoc(userDocRef, {
          refillReminders: updatedReminders
        });
        
        // Show success message with animation
        toast.success(
          <div>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
            <strong>{selectedMed.medicine}</strong> has been refilled!
          </div>,
          {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
              background: '#4CAF50',
              color: 'white',
              fontSize: '1.1rem',
              padding: '1rem'
            }
          }
        );
      } else {
        toast.error("Could not find reminder to mark as refilled.");
      }
    } catch (error) {
      console.error("Error marking medication as refilled:", error);
      toast.error("Error updating medication status");
    } finally {
      setShowConfirmDialog(false);
      setSelectedMed(null);
    }
  };

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
    if (diff <= DAYS_BEFORE_REFILL) return "warning";
    return "low";
  };

  const deleteRefillReminder = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      const data = userDoc.data();
      const reminders = data?.refillReminders || [];

      const updatedReminders = reminders.filter(rem => rem.id !== id);

      await updateDoc(userDocRef, {
        refillReminders: updatedReminders
      });

      toast.success("Refill reminder deleted successfully!");
    } catch (error) {
      console.error("Error deleting refill reminder:", error);
      toast.error("Error deleting refill reminder. Please try again.");
    }
  };

  return (
    <div className="refill-reminders-section">
      <div className="section-header">
        <h2><i className="fas fa-capsules"></i> Medication Refill Reminders</h2>
        <p className="section-description">Track your medication supply and get notified when it's time to refill</p>
      </div>

      <div className="refill-controls">
        <div className="filter-controls">
          <div className="filter-group">
            <label><i className="fas fa-filter"></i> Filter</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Medications</option>
              <option value="active">Active Medications</option>
              <option value="refilled">Refilled Medications</option>
            </select>
          </div>

          <div className="sort-group">
            <label><i className="fas fa-sort"></i> Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="urgency">Sort by Urgency</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Refill Date</option>
            </select>
          </div>
        </div>

        {!showAddForm ? (
          <button 
            className="btn btn-primary add-refill-btn"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus"></i> Add New Refill Reminder
          </button>
        ) : (
          <div className="add-refill-card">
            <div className="card-header">
              <h3><i className="fas fa-plus-circle"></i> Add New Refill Reminder</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="refill-form">
              <div className="form-group">
                <label><i className="fas fa-pills"></i> Medicine Name *</label>
                <input
                  type="text"
                  value={newRefill.medicine}
                  onChange={(e) => setNewRefill({ ...newRefill, medicine: e.target.value })}
                  placeholder="Enter medicine name"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><i className="fas fa-balance-scale"></i> Starting Quantity *</label>
                  <input
                    type="number"
                    value={newRefill.currentQuantity}
                    onChange={(e) => setNewRefill({ ...newRefill, currentQuantity: e.target.value })}
                    placeholder="Number of pills/capsules"
                    className="form-control"
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-calculator"></i> Daily Dosage *</label>
                  <input
                    type="number"
                    value={newRefill.dailyDosage}
                    onChange={(e) => setNewRefill({ ...newRefill, dailyDosage: e.target.value })}
                    placeholder="Pills/capsules per day"
                    className="form-control"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><i className="fas fa-shopping-cart"></i> Refill Quantity</label>
                  <input
                    type="number"
                    value={newRefill.refillQuantity}
                    onChange={(e) => setNewRefill({ ...newRefill, refillQuantity: e.target.value })}
                    placeholder="Quantity to refill (defaults to starting quantity)"
                    className="form-control"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-clinic-medical"></i> Pharmacy</label>
                  <input
                    type="text"
                    value={newRefill.pharmacy}
                    onChange={(e) => setNewRefill({ ...newRefill, pharmacy: e.target.value })}
                    placeholder="Preferred pharmacy"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label><i className="fas fa-sticky-note"></i> Notes</label>
                <textarea
                  value={newRefill.notes}
                  onChange={(e) => setNewRefill({ ...newRefill, notes: e.target.value })}
                  placeholder="Add any special instructions or notes"
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  onClick={addRefillReminder}
                  className="btn btn-success"
                >
                  <i className="fas fa-save"></i> Save Reminder
                </button>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-message">
          <i className="fas fa-spinner fa-spin"></i> Loading reminders...
        </div>
      ) : refillMeds.length === 0 ? (
        null
      ) : (
        <div className="refill-grid">
          {refillMeds.map((med) => {
            const urgency = getUrgencyLevel(med.refillDate);
            const urgencyColors = {
              critical: { bg: "#ffebee", border: "#d32f2f", text: "#d32f2f" },
              urgent: { bg: "#fff3e0", border: "#f57c00", text: "#f57c00" },
              warning: { bg: "#fff8e1", border: "#ffa000", text: "#ffa000" },
              low: { bg: "#e3f2fd", border: "#2196f3", text: "#2196f3" }
            };
            
            const daysUntilRefill = med.refillDate ? 
              Math.ceil((new Date(med.refillDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
              null;

            return (
              <div
                key={med.id}
                className="refill-card"
                style={{
                  background: urgencyColors[urgency]?.bg || '',
                  border: `2px solid ${urgencyColors[urgency]?.border || '#ccc'}`,
                  borderRadius: '15px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div className="refill-header">
                  <h3 style={{ color: urgencyColors[urgency]?.text || '#333' }}>
                    <i className="fas fa-pills"></i> {med.medicine}
                  </h3>
                  <span className={`urgency-badge ${urgency}`}>
                    {urgency === 'critical' ? 'Critical' : urgency === 'urgent' ? 'Urgent' : urgency === 'warning' ? 'Warning' : 'Low Urgency'}
                  </span>
                </div>

                <div className="refill-details">
                  {med.currentQuantity > 0 && (
                    <div className="detail-item">
                      <i className="fas fa-calculator"></i>
                      <span>Current Quantity: <strong>{med.currentQuantity}</strong> units</span>
                    </div>
                  )}
                  {med.currentQuantity <= 0 && (
                    <div className="detail-item" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                      <i className="fas fa-check-circle"></i>
                      <span>Last refilled on: <strong>{new Date(med.lastRefilled).toLocaleDateString()}</strong></span>
                    </div>
                  )}
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>Daily Dosage: <strong>{med.dailyDosage}</strong> units</span>
                  </div>
                  {med.refillDate && (
                    <div className="detail-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Refill by: <strong>{new Date(med.refillDate).toLocaleDateString()}</strong></span>
                      {daysUntilRefill !== null && (
                        <span className="days-remaining">
                          ({daysUntilRefill < 0 ? 'Past Due' : 
                            daysUntilRefill === 0 ? 'Due Today' :
                            `${daysUntilRefill} ${daysUntilRefill === 1 ? 'day' : 'days'} remaining`})
                        </span>
                      )}
                    </div>
                  )}
                  {med.pharmacy && (
                    <div className="detail-item">
                      <i className="fas fa-clinic-medical"></i>
                      <span>Pharmacy: <strong>{med.pharmacy}</strong></span>
                    </div>
                  )}
                  {med.notes && (
                    <div className="detail-item">
                      <i className="fas fa-sticky-note"></i>
                      <span className="notes-text">{med.notes}</span>
                    </div>
                  )}
                </div>

                <div className="refill-actions" style={{ display: 'flex', gap: '10px' }}>
                  {med.currentQuantity <= 0 ? (
                    <button
                      disabled
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        opacity: '0.7',
                        cursor: 'not-allowed'
                      }}
                    >
                      <i className="fas fa-check-circle"></i> Refilled
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsRefilled(med)}
                      className="btn btn-success"
                      style={{
                         flex: 1,
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="fas fa-check"></i> Mark as Refilled
                    </button>
                  )}
                   <button
                    onClick={() => deleteRefillReminder(med.id)}
                    className="btn btn-danger"
                    style={{
                      flex: 1,
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showConfirmDialog && selectedMed && (
        <div className="reminder-modal-overlay">
          <div className="reminder-modal">
            <div className="reminder-modal-content">
              <div className="reminder-modal-header">
                <i className="fas fa-check-circle" style={{ color: '#4CAF50' }}></i>
                <h3>Confirm Refill</h3>
              </div>
              <div className="reminder-modal-body">
                <div className="medicine-info">
                  <div className="info-item">
                    <i className="fas fa-pills"></i>
                    <span>Are you sure you want to mark <strong>{selectedMed.medicine}</strong> as refilled?</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-balance-scale"></i>
                    <span>New quantity will be set to: <strong>{selectedMed.refillQuantity}</strong> units</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-calculator"></i>
                    <span>Daily dosage: <strong>{selectedMed.dailyDosage}</strong> units</span>
                  </div>
                </div>
                <div className="reminder-actions">
                  <button 
                    onClick={markAsRefilled}
                    className="btn btn-success mark-taken-btn"
                  >
                    <i className="fas fa-check"></i> Confirm Refill
                  </button>
                  <button 
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setSelectedMed(null);
                    }}
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RefillReminders; 