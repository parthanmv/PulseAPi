import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const username = user?.email ? user.email.split('@')[0] : 'User';
  const initials = user?.email ? user.email.split('@')[0].substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">P</div>
          <span className="brand-name">PulseAPI</span>
        </div>
        
        <nav className="nav-menu">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/apis" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🔌</span>
            <span className="nav-text">APIs</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <span className="nav-icon">🔒</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-status">
            <span className="status-indicator-dot online"></span>
            <span className="status-text">All Monitors Operational</span>
          </div>
          <div className="header-user">
            <span className="user-name">{username}</span>
            <div className="user-avatar">{initials}</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
