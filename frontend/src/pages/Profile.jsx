import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatIST } from '../utils/ist';
import './Pages.css';

export default function Profile() {
  const { user } = useAuth();

  const initials = user?.email ? user.email.split('@')[0].substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Profile</h1>
        <p className="page-subtitle">Manage your account details and notification preferences.</p>
      </div>

      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-avatar-large">{initials}</div>
          <h2 style={{ fontSize: '1.2rem' }}>Developer User</h2>
          <span className="user-role">PulseAPI Monitor Owner</span>
          
          <div className="profile-divider"></div>
          
          <div className="profile-meta">
            <div className="meta-row">
              <span className="meta-label">Email:</span>
              <span className="meta-value">{user?.email || 'Loading...'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Account ID:</span>
              <span className="meta-value">#{user?.id || 'N/A'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Created At:</span>
              <span className="meta-value">
                {user?.created_at ? formatIST(user.created_at) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="preferences-card">
          <h3>Notification Preferences</h3>
          <form onSubmit={(e) => e.preventDefault()} className="profile-form">
            <div className="toggle-group">
              <div className="toggle-info">
                <strong>Slack Alerts</strong>
                <p>Notify when an endpoint is down.</p>
              </div>
              <input type="checkbox" defaultChecked className="mock-toggle" />
            </div>

            <div className="toggle-group">
              <div className="toggle-info">
                <strong>Email Summaries</strong>
                <p>Send daily performance statistics.</p>
              </div>
              <input type="checkbox" defaultChecked className="mock-toggle" />
            </div>

            <button type="button" className="btn btn-primary" onClick={() => alert('Preferences saved!')}>
              Save Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
