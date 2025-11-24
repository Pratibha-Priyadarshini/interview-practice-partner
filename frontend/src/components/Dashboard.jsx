import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileTab from './ProfileTab';
import InterviewTab from './InterviewTab';
import ReportsTab from './ReportsTab';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🎯 Interview Partner</h2>
        </div>
        <div className="nav-tabs">
          <button
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => setActiveTab('home')}
          >
            <span className="tab-icon">👤</span> Profile
          </button>
          <button
            className={activeTab === 'interview' ? 'active' : ''}
            onClick={() => setActiveTab('interview')}
          >
            <span className="tab-icon">🎤</span> Interview
          </button>
          <button
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            <span className="tab-icon">📊</span> Reports
          </button>
        </div>
        <div className="nav-user">
          <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className="user-name">{user?.full_name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {activeTab === 'home' && <ProfileTab />}
        {activeTab === 'interview' && <InterviewTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
};

export default Dashboard;
