import React from 'react'
import './FeedbackDisplay.css'

function FeedbackDisplay({ feedback, onNewInterview, onStartNew }) {
  // Support both prop names for backwards compatibility
  const handleNewInterview = onNewInterview || onStartNew;
  const formatScore = (score) => {
    const s = score || 0
    return Math.round(s * 10) / 10
  }

  const getScoreColor = (score) => {
    const s = score || 0
    if (s >= 8) return '#4caf50'
    if (s >= 6) return '#ff9800'
    return '#f44336'
  }

  const getScorePercentage = (score) => {
    return ((score || 0) / 10) * 100
  }

  return (
    <div className="feedback-display">
      <div className="feedback-card">
        <div className="feedback-header">
          <h2>🎯 Interview Performance Report</h2>
          <p className="feedback-subtitle">Comprehensive Analysis & Recommendations</p>
        </div>

        {/* Score Dashboard - Landscape Grid */}
        <div className="scores-dashboard">
          <div className="score-card overall-score-card">
            <div className="score-card-header">
              <span className="score-icon">🎯</span>
              <span className="score-title">Overall Score</span>
            </div>
            <div 
              className="score-circle-large"
              style={{ 
                '--score': getScorePercentage(feedback.overall_score),
                '--score-color': getScoreColor(feedback.overall_score)
              }}
            >
              <div className="score-circle-inner">
                <span className="score-value-large">{formatScore(feedback.overall_score)}</span>
                <span className="score-label-large">/ 10</span>
              </div>
            </div>
            <div className="score-rating">
              {feedback.overall_score >= 8 ? '🌟 Excellent' : 
               feedback.overall_score >= 6 ? '👍 Good' : '📈 Needs Improvement'}
            </div>
          </div>

          <div className="score-card">
            <div className="score-card-header">
              <span className="score-icon">💬</span>
              <span className="score-title">Communication</span>
            </div>
            <div 
              className="score-circle"
              style={{ 
                '--score': getScorePercentage(feedback.communication_score),
                '--score-color': getScoreColor(feedback.communication_score)
              }}
            >
              <div className="score-circle-inner">
                <span className="score-value">{formatScore(feedback.communication_score)}</span>
                <span className="score-label">/ 10</span>
              </div>
            </div>
            <div className="score-bar-mini">
              <div 
                className="score-bar-fill"
                style={{ 
                  width: `${getScorePercentage(feedback.communication_score)}%`,
                  backgroundColor: getScoreColor(feedback.communication_score)
                }}
              ></div>
            </div>
          </div>

          <div className="score-card">
            <div className="score-card-header">
              <span className="score-icon">💻</span>
              <span className="score-title">Technical</span>
            </div>
            <div 
              className="score-circle"
              style={{ 
                '--score': getScorePercentage(feedback.technical_score),
                '--score-color': getScoreColor(feedback.technical_score)
              }}
            >
              <div className="score-circle-inner">
                <span className="score-value">{formatScore(feedback.technical_score)}</span>
                <span className="score-label">/ 10</span>
              </div>
            </div>
            <div className="score-bar-mini">
              <div 
                className="score-bar-fill"
                style={{ 
                  width: `${getScorePercentage(feedback.technical_score)}%`,
                  backgroundColor: getScoreColor(feedback.technical_score)
                }}
              ></div>
            </div>
          </div>

          <div className="score-card">
            <div className="score-card-header">
              <span className="score-icon">📚</span>
              <span className="score-title">Preparation</span>
            </div>
            <div 
              className="score-circle"
              style={{ 
                '--score': getScorePercentage(feedback.preparation_score),
                '--score-color': getScoreColor(feedback.preparation_score)
              }}
            >
              <div className="score-circle-inner">
                <span className="score-value">{formatScore(feedback.preparation_score)}</span>
                <span className="score-label">/ 10</span>
              </div>
            </div>
            <div className="score-bar-mini">
              <div 
                className="score-bar-fill"
                style={{ 
                  width: `${getScorePercentage(feedback.preparation_score)}%`,
                  backgroundColor: getScoreColor(feedback.preparation_score)
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Video Analysis Section - Enhanced */}
        {feedback.video_analysis && (
          <div className="video-analysis-section">
            <h3>📹 Video Analysis Report</h3>
            <div className="video-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">👁️</div>
                <div className="metric-content">
                  <div className="metric-label">Eye Contact</div>
                  <div className={`metric-value ${feedback.video_analysis.overall_eye_contact || 'not_analyzed'}`}>
                    {feedback.video_analysis.overall_eye_contact === 'good' ? '85%' :
                     feedback.video_analysis.overall_eye_contact === 'moderate' ? '60%' :
                     feedback.video_analysis.overall_eye_contact === 'poor' ? '35%' : 
                     feedback.video_analysis.overall_eye_contact === 'not_analyzed' ? 'N/A' : 'N/A'}
                  </div>
                  <div className="metric-status">
                    {feedback.video_analysis.overall_eye_contact === 'good' ? '✅ Excellent' :
                     feedback.video_analysis.overall_eye_contact === 'moderate' ? '⚠️ Fair' :
                     feedback.video_analysis.overall_eye_contact === 'poor' ? '❌ Needs Work' : 
                     feedback.video_analysis.overall_eye_contact === 'not_analyzed' ? '⚪ Not Analyzed' : '⚪ Unknown'}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">💪</div>
                <div className="metric-content">
                  <div className="metric-label">Confidence</div>
                  <div className={`metric-value ${feedback.video_analysis.average_confidence || 'not_analyzed'}`}>
                    {feedback.video_analysis.average_confidence === 'high' ? '8.5/10' :
                     feedback.video_analysis.average_confidence === 'moderate' ? '6.0/10' :
                     feedback.video_analysis.average_confidence === 'low' ? '4.0/10' : 
                     feedback.video_analysis.average_confidence === 'not_analyzed' ? 'N/A' : 'N/A'}
                  </div>
                  <div className="metric-status">
                    {feedback.video_analysis.average_confidence === 'high' ? '✅ Strong' :
                     feedback.video_analysis.average_confidence === 'moderate' ? '⚠️ Moderate' :
                     feedback.video_analysis.average_confidence === 'low' ? '❌ Low' : 
                     feedback.video_analysis.average_confidence === 'not_analyzed' ? '⚪ Not Analyzed' : '⚪ Unknown'}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🎥</div>
                <div className="metric-content">
                  <div className="metric-label">Frames Analyzed</div>
                  <div className="metric-value neutral">
                    {feedback.video_analysis.total_frames_analyzed || 0}
                  </div>
                  <div className="metric-status">
                    {feedback.video_analysis.total_frames_analyzed > 0 ? '✅ Captured' : '⚪ None'}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🛡️</div>
                <div className="metric-content">
                  <div className="metric-label">Malpractice</div>
                  <div className={`metric-value ${feedback.video_analysis.malpractice_count > 0 ? 'poor' : 'good'}`}>
                    {feedback.video_analysis.malpractice_count || 0}
                  </div>
                  <div className="metric-status">
                    {feedback.video_analysis.malpractice_count > 0 ? '⚠️ Detected' : '✅ Clean'}
                  </div>
                </div>
              </div>
            </div>

            {feedback.video_analysis.malpractice_incidents && feedback.video_analysis.malpractice_incidents.length > 0 && (
              <div className="malpractice-alert">
                <h4>⚠️ Malpractice Alerts</h4>
                <div className="malpractice-incidents">
                  {feedback.video_analysis.malpractice_incidents.map((incident, idx) => (
                    <div key={idx} className="incident-card">
                      <span className="incident-severity">{incident.severity === 'detected' ? '🔴' : '🟡'}</span>
                      <div className="incident-info">
                        <div className="incident-details">{incident.notes}</div>
                        <div className="incident-time">{new Date(incident.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feedback.video_analysis.key_observations && feedback.video_analysis.key_observations.length > 0 && (
              <div className="video-observations">
                <h4>🔍 Key Observations</h4>
                <div className="observations-grid">
                  {feedback.video_analysis.key_observations.map((obs, idx) => (
                    <div key={idx} className="observation-item">
                      <span className="observation-bullet">•</span>
                      <span className="observation-text">{obs}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feedback.video_analysis.total_frames_analyzed === 0 && (
              <div className="video-not-analyzed">
                <div className="not-analyzed-icon">📹</div>
                <div className="not-analyzed-content">
                  <h4>Video Analysis Not Available</h4>
                  <p>
                    {feedback.video_analysis.note || 
                     'Video analysis requires camera access and API configuration. Enable it in your next interview for detailed body language and presentation feedback.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Breakdown Chart */}
        <div className="performance-chart-section">
          <h3>📊 Performance Breakdown</h3>
          <div className="chart-container">
            <div className="bar-chart">
              <div className="chart-bar-wrapper">
                <div className="chart-label">
                  <span className="label-icon">💬</span>
                  <span className="label-text">Communication</span>
                </div>
                <div className="chart-bar-track">
                  <div 
                    className="chart-bar-fill"
                    style={{
                      width: `${getScorePercentage(feedback.communication_score)}%`,
                      backgroundColor: getScoreColor(feedback.communication_score)
                    }}
                  >
                    <span className="bar-value">{formatScore(feedback.communication_score)}</span>
                  </div>
                </div>
                <div className="chart-percentage">{Math.round(getScorePercentage(feedback.communication_score))}%</div>
              </div>

              <div className="chart-bar-wrapper">
                <div className="chart-label">
                  <span className="label-icon">💻</span>
                  <span className="label-text">Technical Skills</span>
                </div>
                <div className="chart-bar-track">
                  <div 
                    className="chart-bar-fill"
                    style={{
                      width: `${getScorePercentage(feedback.technical_score)}%`,
                      backgroundColor: getScoreColor(feedback.technical_score)
                    }}
                  >
                    <span className="bar-value">{formatScore(feedback.technical_score)}</span>
                  </div>
                </div>
                <div className="chart-percentage">{Math.round(getScorePercentage(feedback.technical_score))}%</div>
              </div>

              <div className="chart-bar-wrapper">
                <div className="chart-label">
                  <span className="label-icon">📚</span>
                  <span className="label-text">Preparation</span>
                </div>
                <div className="chart-bar-track">
                  <div 
                    className="chart-bar-fill"
                    style={{
                      width: `${getScorePercentage(feedback.preparation_score)}%`,
                      backgroundColor: getScoreColor(feedback.preparation_score)
                    }}
                  >
                    <span className="bar-value">{formatScore(feedback.preparation_score)}</span>
                  </div>
                </div>
                <div className="chart-percentage">{Math.round(getScorePercentage(feedback.preparation_score))}%</div>
              </div>

              <div className="chart-bar-wrapper">
                <div className="chart-label">
                  <span className="label-icon">🎯</span>
                  <span className="label-text">Overall Performance</span>
                </div>
                <div className="chart-bar-track">
                  <div 
                    className="chart-bar-fill overall-bar"
                    style={{
                      width: `${getScorePercentage(feedback.overall_score)}%`,
                      backgroundColor: getScoreColor(feedback.overall_score)
                    }}
                  >
                    <span className="bar-value">{formatScore(feedback.overall_score)}</span>
                  </div>
                </div>
                <div className="chart-percentage">{Math.round(getScorePercentage(feedback.overall_score))}%</div>
              </div>
            </div>

            {/* Score Distribution Visualization */}
            <div className="score-distribution">
              <h4>Score Distribution</h4>
              <div className="distribution-bars">
                <div className="distribution-item">
                  <div className="distribution-label">Excellent (8-10)</div>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill excellent"
                      style={{
                        width: `${[feedback.communication_score, feedback.technical_score, feedback.preparation_score, feedback.overall_score].filter(s => s >= 8).length * 25}%`
                      }}
                    ></div>
                  </div>
                  <div className="distribution-count">
                    {[feedback.communication_score, feedback.technical_score, feedback.preparation_score, feedback.overall_score].filter(s => s >= 8).length}/4
                  </div>
                </div>
                <div className="distribution-item">
                  <div className="distribution-label">Good (6-7.9)</div>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill good"
                      style={{
                        width: `${[feedback.communication_score, feedback.technical_score, feedback.preparation_score, feedback.overall_score].filter(s => s >= 6 && s < 8).length * 25}%`
                      }}
                    ></div>
                  </div>
                  <div className="distribution-count">
                    {[feedback.communication_score, feedback.technical_score, feedback.preparation_score, feedback.overall_score].filter(s => s >= 6 && s < 8).length}/4
                  </div>
                </div>
                <div className="distribution-item">
                  <div className="distribution-label">Needs Work (&lt;6)</div>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill needs-work"
                      style={{
                        width: `${[feedback.communication_score, feedback.technical_score, feedback.preparation_score, feedback.overall_score].filter(s => s < 6).length * 25}%`
                      }}
                    ></div>
                  </div>
                  <div className="distribution-count">
                    {[feedback.communication_score, feedback.technical_score, feedback.preparation_score, feedback.overall_score].filter(s => s < 6).length}/4
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Grid - Landscape Layout */}
        <div className="feedback-grid">
          <div className="feedback-section strengths-section">
            <h3><span className="section-icon">✨</span> Strengths</h3>
            <div className="strength-count">
              <span className="count-badge">{feedback.strengths?.length || 0}</span>
              <span className="count-label">Identified</span>
            </div>
            <ul className="feedback-list strengths">
              {feedback.strengths && Array.isArray(feedback.strengths) && feedback.strengths.length > 0 ? (
                feedback.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))
              ) : (
                <li>Keep working on your interview skills!</li>
              )}
            </ul>
          </div>

          <div className="feedback-section improvements-section">
            <h3><span className="section-icon">📈</span> Areas for Improvement</h3>
            <div className="strength-count">
              <span className="count-badge warning">{feedback.areas_for_improvement?.length || 0}</span>
              <span className="count-label">To Focus On</span>
            </div>
            <ul className="feedback-list improvements">
              {feedback.areas_for_improvement && Array.isArray(feedback.areas_for_improvement) && feedback.areas_for_improvement.length > 0 ? (
                feedback.areas_for_improvement.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))
              ) : (
                <li>Great job! Continue to refine your answers.</li>
              )}
            </ul>
          </div>

          <div className="feedback-section recommendations-section">
            <h3><span className="section-icon">💡</span> Recommendations</h3>
            <div className="strength-count">
              <span className="count-badge info">{feedback.recommendations?.length || 0}</span>
              <span className="count-label">Action Items</span>
            </div>
            <ul className="feedback-list recommendations">
              {feedback.recommendations && Array.isArray(feedback.recommendations) && feedback.recommendations.length > 0 ? (
                feedback.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))
              ) : (
                <li>Continue practicing with different scenarios.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Detailed Analysis - Full Width */}
        {feedback.detailed_analysis && (
          <div className="feedback-section detailed-analysis-section">
            <h3><span className="section-icon">📊</span> Detailed Analysis</h3>
            <div className="detailed-feedback">
              {feedback.detailed_analysis.split('\n').map((paragraph, idx) => (
                paragraph && <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {feedback.detailed_feedback && (
          <div className="feedback-section detailed-feedback-section">
            <h3><span className="section-icon">📝</span> Comprehensive Feedback</h3>
            <div className="detailed-feedback">
              {feedback.detailed_feedback.split('\n').map((line, idx) => (
                line && <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        )}

        <div className="feedback-actions">
          <button onClick={handleNewInterview} className="btn-primary">
            🚀 Start New Interview
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackDisplay
