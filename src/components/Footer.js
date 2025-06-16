import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer bg-light text-center py-3 mt-auto">
    <div className="container">
      <span className="text-muted">
        &copy; {new Date().getFullYear()} MedEase &nbsp;|&nbsp;
        <Link to="/contact" className="text-primary fw-bold" style={{ fontSize: '1.15rem' }}>
          Click here to contact us
        </Link>
      </span>
    </div>
  </footer>
);

export default Footer; 