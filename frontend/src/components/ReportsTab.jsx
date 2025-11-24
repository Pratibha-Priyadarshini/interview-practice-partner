import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ReportsTab.css';

const ReportsTab = () => {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchInterviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(response.data);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewDetail = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedInterview(response.data);
    } catch (error) {
      console.error('Failed to fetch interview detail:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#FF5252';
  };

  if (loading) {
    return <div className="loading">Loading your interview history...</div>;
  }

  if (interviews.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h2>No Interviews Yet</h2>
        <p>Complete your first interview to see reports here</p>
      </div>
    );
  }

  return (
    <div className="reports-tab">
      {!selectedInterview ? (
        <div className="reports-list">
          <h2>Interview History</h2>
          <div className="interviews-grid">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="interview-card"
                onClick={() => fetchInterviewDetail(interview.id)}
              >
                <div className="interview-header">
                  <h3>{interview.role.replace('_', ' ').toUpperCase()}</h3>
                  <span className="interview-round">{interview.interview_round}</span>
                </div>
                <div className="interview-meta">
                  <span>📅 {new Date(interview.completed_at).toLocaleDateString()}</span>
                  <span>⏱️ {interview.duration_minutes} min</span>
                </div>
                <div className="score-display">
                  <div className="score-circle" style={{ borderColor: getScoreColor(interview.overall_score) }}>
                    <span className="score-value">{interview.overall_score}</span>
                    <span className="score-label">Overall</span>
                  </div>
                  <div className="score-breakdown">
                    <div className="score-item">
                      <span className="score-name">Communication</span>
                      <span className="score-num">{interview.communication_score}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-name">Technical</span>
                      <span className="score-num">{interview.technical_score}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-name">Preparation</span>
                      <span className="score-num">{interview.preparation_score}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="report-detail">
          <button onClick={() => setSelectedInterview(null)} className="back-btn">
            ← Back to History
          </button>

          <div className="detail-header">
            <h1>{selectedInterview.role.replace('_', ' ').toUpperCase()} Interview</h1>
            <div className="detail-meta">
              <span>{selectedInterview.interview_round} Round</span>
              <span>•</span>
              <span>{new Date(selectedInterview.completed_at).toLocaleString()}</span>
              <span>•</span>
              <span>{selectedInterview.duration_minutes} minutes</span>
            </div>
          </div>

          <div className="scores-section">
            <div className="score-card">
              <div className="score-big" style={{ color: getScoreColor(selectedInterview.overall_score) }}>
                {selectedInterview.overall_score}
              </div>
              <div className="score-title">Overall Score</div>
            </div>
            <div className="score-card">
              <div className="score-big">{selectedInterview.communication_score}</div>
              <div className="score-title">Communication</div>
            </div>
            <div className="score-card">
              <div className="score-big">{selectedInterview.technical_score}</div>
              <div className="score-title">Technical</div>
            </div>
            <div className="score-card">
              <div className="score-big">{selectedInterview.preparation_score}</div>
              <div className="score-title">Preparation</div>
            </div>
          </div>

          <div className="feedback-sections">
            <div className="feedback-section">
              <h3>✅ Strengths</h3>
              <ul>
                {selectedInterview.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-section">
              <h3>📈 Areas for Improvement</h3>
              <ul>
                {selectedInterview.areas_for_improvement.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-section">
              <h3>💡 Recommendations</h3>
              <ul>
                {selectedInterview.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            {selectedInterview.detailed_feedback && (
              <div className="feedback-section full-width">
                <h3>📝 Detailed Feedback</h3>
                <p className="detailed-text">{selectedInterview.detailed_feedback}</p>
              </div>
            )}

            {selectedInterview.video_analysis && Object.keys(selectedInterview.video_analysis).length > 0 && (
              <div className="feedback-section full-width">
                <h3>🎥 Video Analysis</h3>
                <div className="video-stats">
                  <div className="video-stat">
                    <span className="stat-label">Eye Contact</span>
                    <span className="stat-value">{selectedInterview.video_analysis.eye_contact_percentage || 'N/A'}%</span>
                  </div>
                  <div className="video-stat">
                    <span className="stat-label">Confidence</span>
                    <span className="stat-value">{selectedInterview.video_analysis.confidence_score || 'N/A'}/10</span>
                  </div>
                  <div className="video-stat">
                    <span className="stat-label">Malpractice Detected</span>
                    <span className="stat-value">{selectedInterview.video_analysis.malpractice_count || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
