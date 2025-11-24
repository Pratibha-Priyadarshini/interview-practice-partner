import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ProfileTab.css';

const ProfileTab = () => {
  const { user, token, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-tab">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user?.full_name}</h1>
          <p>{user?.email}</p>
          <p className="member-since">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Personal Information</h3>
          {!editing ? (
            <div className="info-display">
              <div className="info-row">
                <span className="info-label">Full Name:</span>
                <span className="info-value">{user?.full_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{user?.phone || 'Not provided'}</span>
              </div>
              <button onClick={() => setEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading} className="save-btn">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-card">
          <h3>Interview Statistics</h3>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total_interviews}</div>
                <div className="stat-label">Total Interviews</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.average_overall_score}</div>
                <div className="stat-label">Avg Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.best_score}</div>
                <div className="stat-label">Best Score</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.recent_trend}</div>
                <div className="stat-label">Trend</div>
              </div>
            </div>
          ) : (
            <p className="no-data">No interview data yet. Start your first interview!</p>
          )}
        </div>

        <div className="profile-card">
          <h3>Performance Breakdown</h3>
          {stats && stats.total_interviews > 0 ? (
            <div className="performance-bars">
              <div className="performance-item">
                <span className="perf-label">Communication</span>
                <div className="perf-bar">
                  <div className="perf-fill" style={{ width: `${stats.average_communication_score}%` }}></div>
                </div>
                <span className="perf-value">{stats.average_communication_score}</span>
              </div>
              <div className="performance-item">
                <span className="perf-label">Technical</span>
                <div className="perf-bar">
                  <div className="perf-fill" style={{ width: `${stats.average_technical_score}%` }}></div>
                </div>
                <span className="perf-value">{stats.average_technical_score}</span>
              </div>
              <div className="performance-item">
                <span className="perf-label">Preparation</span>
                <div className="perf-bar">
                  <div className="perf-fill" style={{ width: `${stats.average_preparation_score}%` }}></div>
                </div>
                <span className="perf-value">{stats.average_preparation_score}</span>
              </div>
            </div>
          ) : (
            <p className="no-data">Complete interviews to see your performance breakdown</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
