import React from "react";

const ContactUs = () => (
  <div className="container py-5">
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <div className="card shadow border-0">
          <div className="card-body text-center p-5">
            <h2 className="mb-4" style={{ color: '#1976d2', fontWeight: 700 }}>
              <i className="fas fa-headset me-2"></i>Contact Us
            </h2>
            <p className="mb-4 text-muted fs-5">
              Have questions or need assistance? We're here to help!
            </p>
            <div className="mb-3 d-flex align-items-center justify-content-center">
              <i className="fas fa-envelope fa-lg text-primary me-3"></i>
              <a href="mailto:amoghak2004@gmail.com" className="fs-5 text-decoration-none">
                amoghak2004@gmail.com
              </a>
            </div>
            <div className="mb-3 d-flex align-items-center justify-content-center">
              <i className="fas fa-phone fa-lg text-primary me-3"></i>
              <a href="tel:+916363944928" className="fs-5 text-decoration-none">
                +91 6363944928
              </a>
            </div>
            <div className="d-flex align-items-center justify-content-center">
              <i className="fas fa-phone fa-lg text-primary me-3"></i>
              <a href="tel:+918431851363" className="fs-5 text-decoration-none">
                +91 8431851363
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ContactUs; 