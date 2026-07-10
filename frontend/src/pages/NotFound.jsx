import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-wrapper fade-in">
      <div className="notfound-card">
        <h1 className="notfound-code">404</h1>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Page Not Found</h2>
        <p className="notfound-text">
          The requested page could not be found. Please check the path or click below to return to the Dashboard.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
