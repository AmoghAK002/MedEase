import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper functions for color coding
function getBpStatus(s, d) {
  if (s < 90 || d < 60) return 'warning';
  if ((s >= 90 && s <= 120) && (d >= 60 && d <= 80)) return 'normal';
  if (s > 140 || d > 90) return 'danger';
  return 'warning';
}
function getHrStatus(hr) {
  if (hr < 60) return 'warning';
  if (hr >= 60 && hr <= 100) return 'normal';
  if (hr > 100) return 'danger';
  return 'warning';
}
function getSugarStatus(sugar) {
  if (sugar < 70) return 'warning';
  if (sugar >= 70 && sugar <= 140) return 'normal';
  if (sugar > 180) return 'danger';
  return 'warning';
}

const getBpSuggestion = (s, d) => {
  if (s > 140 || d > 90) return {
    type: 'danger',
    msg: 'Your blood pressure is high. Try to relax, reduce salt intake, and consult your doctor if this is persistent.'
  };
  if (s < 90 || d < 60) return {
    type: 'warning',
    msg: 'Your blood pressure is low. Stay hydrated, eat something salty, and consult your doctor if you feel unwell.'
  };
  return null;
};
const getSugarSuggestion = (sugar) => {
  if (sugar > 180) return {
    type: 'danger',
    msg: 'Your blood sugar is high. Avoid sugary foods and consult your doctor if this is persistent.'
  };
  if (sugar < 70) return {
    type: 'warning',
    msg: 'Your blood sugar is low. Eat or drink something sweet and consult your doctor if you feel unwell.'
  };
  return null;
};

const HealthVitalsTracker = () => {
  const [vitals, setVitals] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    bloodSugar: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [selectedVital, setSelectedVital] = useState('bloodPressure');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchVitalsHistory();
  }, []);

  const fetchVitalsHistory = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setVitalsHistory(data.vitalsHistory || []);
        }
      }
    } catch (error) {
      console.error('Error fetching vitals history:', error);
      toast.error('Error loading vitals history');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setVitals(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVitals(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        // Validate and clean the data before saving
        const cleanedVitals = {
          bloodPressure: {
            systolic: parseInt(vitals.bloodPressure.systolic) || 0,
            diastolic: parseInt(vitals.bloodPressure.diastolic) || 0
          },
          heartRate: parseInt(vitals.heartRate) || 0,
          bloodSugar: parseInt(vitals.bloodSugar) || 0,
          date: vitals.date || new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString()
        };

        // Validate that required fields have values
        if (!cleanedVitals.bloodPressure.systolic || !cleanedVitals.bloodPressure.diastolic) {
          toast.error('Please enter both systolic and diastolic blood pressure values');
          return;
        }

        if (!cleanedVitals.heartRate) {
          toast.error('Please enter heart rate');
          return;
        }

        if (!cleanedVitals.bloodSugar) {
          toast.error('Please enter blood sugar level');
          return;
        }

        // Save to Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          vitalsHistory: arrayUnion(cleanedVitals)
        });

        setVitalsHistory(prev => [...prev, cleanedVitals]);
        setVitals({
          bloodPressure: { systolic: '', diastolic: '' },
          heartRate: '',
          bloodSugar: '',
          date: new Date().toISOString().split('T')[0],
        });
        
        toast.success('Vitals recorded successfully!');
      }
    } catch (error) {
      console.error('Error saving vitals:', error);
      toast.error('Error saving vitals');
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    const filtered = vitalsHistory.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      switch (timeRange) {
        case 'week':
          return entryDate >= new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return entryDate >= new Date(now - 30 * 24 * 60 * 60 * 1000);
        case 'year':
          return entryDate >= new Date(now - 365 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });
    return filtered;
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    const labels = filteredData.map(entry => 
      new Date(entry.timestamp).toLocaleDateString()
    );

    let datasets = [];
    switch (selectedVital) {
      case 'bloodPressure':
        datasets = [
          {
            label: 'Systolic (mmHg)',
            data: filteredData.map(entry => entry.bloodPressure.systolic),
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Diastolic (mmHg)',
            data: filteredData.map(entry => entry.bloodPressure.diastolic),
            borderColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ];
        break;
      case 'heartRate':
        datasets = [{
          label: 'Heart Rate (bpm)',
          data: filteredData.map(entry => entry.heartRate),
          borderColor: '#FF9F1C',
          backgroundColor: 'rgba(255, 159, 28, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }];
        break;
      case 'bloodSugar':
        datasets = [{
          label: 'Blood Sugar (mg/dL)',
          data: filteredData.map(entry => entry.bloodSugar),
          borderColor: '#2EC4B6',
          backgroundColor: 'rgba(46, 196, 182, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }];
        break;
    }

    return {
      labels,
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `${selectedVital === 'bloodPressure' ? 'Blood Pressure' : 
               selectedVital === 'heartRate' ? 'Heart Rate' : 
               'Blood Sugar'} History`,
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const getLatestVitals = () => {
    if (!vitalsHistory.length) return null;
    return vitalsHistory[vitalsHistory.length - 1];
  };
  const latestVitals = getLatestVitals();

  // Get color status
  const bpStatus = latestVitals ? getBpStatus(latestVitals.bloodPressure.systolic, latestVitals.bloodPressure.diastolic) : 'normal';
  const hrStatus = latestVitals ? getHrStatus(latestVitals.heartRate) : 'normal';
  const sugarStatus = latestVitals ? getSugarStatus(latestVitals.bloodSugar) : 'normal';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Suggestion logic
  let suggestion = null;
  if (latestVitals) {
    const bp = getBpSuggestion(latestVitals.bloodPressure.systolic, latestVitals.bloodPressure.diastolic);
    const sugar = getSugarSuggestion(latestVitals.bloodSugar);
    suggestion = bp || sugar;
  }

  return (
    <div className="health-vitals-tracker">
      <h2>Health Vitals Tracker</h2>
      <div className="vitals-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <i className="fas fa-heartbeat"></i>
              Blood Pressure (mmHg)
            </label>
            <div className="bp-inputs">
              <input
                type="number"
                name="bloodPressure.systolic"
                value={vitals.bloodPressure.systolic}
                onChange={handleInputChange}
                placeholder="Systolic"
                required
                min="60"
                max="200"
              />
              <span>/</span>
              <input
                type="number"
                name="bloodPressure.diastolic"
                value={vitals.bloodPressure.diastolic}
                onChange={handleInputChange}
                placeholder="Diastolic"
                required
                min="40"
                max="120"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-heart"></i>
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              name="heartRate"
              value={vitals.heartRate}
              onChange={handleInputChange}
              placeholder="Enter heart rate"
              required
              min="40"
              max="200"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-tint"></i>
              Blood Sugar (mg/dL)
            </label>
            <input
              type="number"
              name="bloodSugar"
              value={vitals.bloodSugar}
              onChange={handleInputChange}
              placeholder="Enter blood sugar level"
              required
              min="40"
              max="400"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-calendar"></i>
              Date
            </label>
            <input
              type="date"
              name="date"
              value={vitals.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <i className="fas fa-save"></i>
            Record Vitals
          </button>
        </form>
      </div>

      {suggestion && (
        <div className={`vital-suggestion ${suggestion.type}`}>
          <i className={`fas fa-${suggestion.type === 'danger' ? 'exclamation-triangle' : 'info-circle'}`}></i>
          {suggestion.msg}
        </div>
      )}

      <div className="vitals-charts">
        <div className="chart-controls">
          <select
            value={selectedVital}
            onChange={(e) => setSelectedVital(e.target.value)}
            className="vital-select"
          >
            <option value="bloodPressure">Blood Pressure</option>
            <option value="heartRate">Heart Rate</option>
            <option value="bloodSugar">Blood Sugar</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="chart-container">
          {selectedVital === 'bloodPressure' ? (
            <Line data={getChartData()} options={chartOptions} />
          ) : (
            <Line data={getChartData()} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthVitalsTracker; 