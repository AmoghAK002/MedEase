import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './YourGuide.css';

const YourGuide = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  const sections = {
    overview: {
      title: "Welcome to Your Guide",
      icon: "fa-book-open",
      content: (
        <div className="guide-overview">
          <div className="welcome-card">
            <div className="welcome-icon">
              <i className="fas fa-book-open"></i>
            </div>
            <h3>How to Use This Guide</h3>
            <p>This guide will help you understand how to use MedEase step by step. Each section has:</p>
            <div className="feature-grid">
              <div className="feature-item">
                <i className="fas fa-text-height"></i>
                <span>Large, easy-to-read text</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-images"></i>
                <span>Clear instructions with pictures</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-list-ol"></i>
                <span>Step-by-step guidance</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-lightbulb"></i>
                <span>Helpful tips and reminders</span>
              </div>
            </div>
          </div>
          <div className="guide-navigation-tips">
            <div className="tips-header">
              <i className="fas fa-compass"></i>
              <h4>Navigation Tips</h4>
            </div>
            <p>Use these buttons to move around:</p>
            <div className="navigation-buttons">
              <button className="nav-btn home-btn">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </button>
              <button className="nav-btn back-btn">
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </button>
              <button className="nav-btn next-btn">
                <i className="fas fa-arrow-right"></i>
                <span>Next</span>
              </button>
            </div>
          </div>
        </div>
      )
    },
    medications: {
      title: "Managing Your Medications",
      icon: "fa-pills",
      content: (
        <div className="guide-section">
          <div className="section-header">
            <i className="fas fa-pills"></i>
            <h3>Setting Up Medication Reminders</h3>
          </div>
          <div className="step-by-step">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-plus-circle"></i>
                  <h4>Add New Medication</h4>
                </div>
                <p>
                  On the Medications page, look for the large green button labeled <b>"Add New Medication"</b> at the top right. If you don't see it, make sure you are on the Medications section from the menu. <br />
                  <b>Tip:</b> The button is designed to be easy to spot and is usually the largest button on the page. Clicking it will open a new form for you to enter your medication details.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-edit"></i>
                  <h4>Enter Medication Details</h4>
                </div>
                <p>
                  In the form, fill in the <b>name</b> of your medication (for example, "Aspirin"), the <b>dosage</b> (such as "75mg"), and any other required information. <br />
                  <b>Tip:</b> If you are unsure about the dosage, check your prescription or ask your doctor. You can also add notes for yourself, like "Take with food." <br />
                  Double-check your entries to make sure they are correct before saving.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-clock"></i>
                  <h4>Set Reminder Time</h4>
                </div>
                <p>
                  Choose the time(s) of day you need to take your medication. You can select multiple times if needed (for example, morning and evening). <br />
                  <b>Tip:</b> Set reminders a few minutes before your usual time to give yourself enough notice. <br />
                  When you're done, click <b>"Save"</b> to add the medication to your list. You will now receive reminders at the times you selected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    vitals: {
      title: "Tracking Your Health Vitals",
      icon: "fa-heartbeat",
      content: (
        <div className="guide-section">
          <div className="section-header">
            <i className="fas fa-heartbeat"></i>
            <h3>Recording Your Health Measurements</h3>
          </div>
          <div className="step-by-step">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-sign-in-alt"></i>
                  <h4>Access Health Vitals</h4>
                </div>
                <p>
                  From the main menu, click on <b>"Health Vitals"</b>. This will take you to the page where you can view and add your health measurements. <br />
                  <b>Tip:</b> If you can't find the menu, look for the heart icon or the word "Vitals" in the sidebar.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-notes-medical"></i>
                  <h4>Enter Your Measurements</h4>
                </div>
                <p>
                  Click the <b>"Add New Reading"</b> button. Enter your blood pressure (systolic/diastolic), heart rate, and blood sugar level in the provided fields. <br />
                  <b>Tip:</b> Use your home monitoring devices to get accurate readings. If you make a mistake, you can edit or delete the entry later.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-chart-line"></i>
                  <h4>View Your Progress</h4>
                </div>
                <p>
                  After saving your readings, you can see your health trends over time in easy-to-read charts and tables. <br />
                  <b>Tip:</b> Use the date picker to view your history for a specific period. This helps you and your doctor track your health more effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    records: {
      title: "Managing Medical Records",
      icon: "fa-file-medical",
      content: (
        <div className="guide-section">
          <div className="section-header">
            <i className="fas fa-file-medical"></i>
            <h3>Storing Your Medical Documents</h3>
          </div>
          <div className="step-by-step">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-plus"></i>
                  <h4>Add New Record</h4>
                </div>
                <p>
                  On the Medical Records page, click the <b>"Add New Record"</b> button. This will open a form for uploading your document. <br />
                  <b>Tip:</b> If you don't see the button, make sure you are in the correct section. The button is usually at the top of the records list.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-tags"></i>
                  <h4>Choose Document Type</h4>
                </div>
                <p>
                  Select the type of document you are uploading (for example, prescription, lab report, or X-ray). <br />
                  <b>Tip:</b> Choosing the correct type helps you find your documents easily later.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-header">
                  <i className="fas fa-upload"></i>
                  <h4>Upload Your File</h4>
                </div>
                <p>
                  Click <b>"Choose File"</b> and select your document from your computer or phone. Then click <b>"Upload"</b> to save it securely. <br />
                  <b>Tip:</b> Supported file types include PDF, JPG, and PNG. If you have trouble uploading, check your internet connection or try a different file.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="your-guide">
      <div className="guide-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-book"></i>
          </div>
          <h2>Your Guide to MedEase</h2>
          <p className="guide-subtitle">Easy step-by-step instructions for using MedEase</p>
        </div>
      </div>

      <div className="guide-container">
        <div className="guide-sidebar">
          <nav className="guide-nav">
            {Object.keys(sections).map((section) => (
              <button
                key={section}
                className={`guide-nav-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => setActiveSection(section)}
              >
                <i className={`fas ${sections[section].icon}`}></i>
                <span>{sections[section].title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="guide-content">
          <div className="guide-section-header">
            <div className="section-icon">
              <i className={`fas ${sections[activeSection].icon}`}></i>
            </div>
            <h3>{sections[activeSection].title}</h3>
          </div>
          <div className="guide-section-content">
            {sections[activeSection].content}
          </div>
        </div>
      </div>

      <div className="guide-controls">
        <button 
          className="guide-control-btn home-btn"
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-home"></i>
          <span>Back to Dashboard</span>
        </button>
        <button 
          className="guide-control-btn prev-btn"
          onClick={() => {
            const sectionsArray = Object.keys(sections);
            const currentIndex = sectionsArray.indexOf(activeSection);
            if (currentIndex > 0) {
              setActiveSection(sectionsArray[currentIndex - 1]);
            }
          }}
        >
          <i className="fas fa-arrow-left"></i>
          <span>Previous</span>
        </button>
        <button 
          className="guide-control-btn next-btn"
          onClick={() => {
            const sectionsArray = Object.keys(sections);
            const currentIndex = sectionsArray.indexOf(activeSection);
            if (currentIndex < sectionsArray.length - 1) {
              setActiveSection(sectionsArray[currentIndex + 1]);
            }
          }}
        >
          <i className="fas fa-arrow-right"></i>
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

export default YourGuide; 