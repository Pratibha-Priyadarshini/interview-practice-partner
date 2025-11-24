import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './InterviewSetup.css'

function InterviewSetup({ onStart, token }) {
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [userName, setUserName] = useState('')
  const [voiceGender, setVoiceGender] = useState('female') // 'male' or 'female'
  const [interviewRound, setInterviewRound] = useState('technical') // 'technical' or 'hr'
  const [duration, setDuration] = useState(30) // Duration in minutes
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeFileName, setResumeFileName] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [parsingResume, setParsingResume] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/interview/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRoles(response.data.roles)
      if (response.data.roles.length > 0) {
        setSelectedRole(response.data.roles[0])
      }
    } catch (err) {
      setError('Failed to load roles. Please try again.')
      console.error(err)
    }
  }

  const handleResumeUpload = async (file) => {
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Resume file size must be less than 5MB')
      return
    }

    setResumeFile(file)
    setResumeFileName(file.name)
    setParsingResume(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post(`${API_URL}/api/interview/resume/parse`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      
      setResumeText(response.data.resume_text || '')
      
      if (!response.data.resume_text || response.data.resume_text.trim().length < 50) {
        setError('Could not extract meaningful text from resume. Please ensure it is a valid PDF with text content.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to parse resume. Please try again.')
      setResumeFile(null)
      setResumeFileName('')
      setResumeText('')
    } finally {
      setParsingResume(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleResumeUpload(file)
    }
  }

  const handleRemoveResume = () => {
    setResumeFile(null)
    setResumeFileName('')
    setResumeText('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedRole || !userName.trim()) {
      setError('Please select a role and enter your name')
      return
    }

    if (parsingResume) {
      setError('Please wait for resume to finish parsing')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_URL}/api/interview/start`, {
        role: selectedRole,
        interview_round: interviewRound,
        duration_minutes: duration,
        voice_gender: voiceGender,
        resume_text: resumeText || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      onStart(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const roleLabels = {
    sales: 'Sales Representative',
    engineer: 'Software Engineer',
    data_analyst: 'Data Analyst',
    product_manager: 'Product Manager',
    business_analyst: 'Business Analyst',
    ui_ux_designer: 'UI/UX Designer',
    devops_engineer: 'DevOps Engineer',
    ml_engineer: 'ML/AI Engineer',
    mobile_developer: 'Mobile App Developer',
    qa_engineer: 'QA Engineer',
    project_manager: 'Project Manager',
    marketing_manager: 'Marketing Manager',
    retail_associate: 'Retail Associate'
  }

  return (
    <div className="interview-setup">
      <div className="setup-card">
        <h2>Start Your Mock Interview</h2>
        <p className="setup-description">
          Choose a role and let our AI interviewer help you practice. The interviewer will
          ask relevant questions and provide feedback to help you improve.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="role">Interview Role:</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading}
              className="form-select"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role] || role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Your Name:</label>
            <input
              id="name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              className="form-input"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="round">Interview Round:</label>
            <select
              id="round"
              value={interviewRound}
              onChange={(e) => setInterviewRound(e.target.value)}
              disabled={loading}
              className="form-select"
            >
              <option value="technical">💻 Technical Round</option>
              <option value="hr">👔 HR Round</option>
            </select>
            <p className="form-hint">
              {interviewRound === 'technical' 
                ? 'Focus on technical skills, problem-solving, and coding' 
                : 'Focus on behavioral questions, culture fit, and soft skills'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Interview Duration:</label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              disabled={loading}
              className="form-select"
            >
              <option value={15}>⏱️ 15 minutes (Quick)</option>
              <option value={30}>⏱️ 30 minutes (Standard)</option>
              <option value={45}>⏱️ 45 minutes (Detailed)</option>
              <option value={60}>⏱️ 60 minutes (Comprehensive)</option>
              <option value={90}>⏱️ 90 minutes (In-depth)</option>
            </select>
            <p className="form-hint">
              {duration === 15 && '5-7 questions, quick assessment'}
              {duration === 30 && '8-12 questions, standard interview'}
              {duration === 45 && '12-15 questions, detailed discussion'}
              {duration === 60 && '15-20 questions, comprehensive interview'}
              {duration === 90 && '20-25 questions, in-depth evaluation'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="voice">Interviewer Voice:</label>
            <select
              id="voice"
              value={voiceGender}
              onChange={(e) => setVoiceGender(e.target.value)}
              disabled={loading}
              className="form-select"
            >
              <option value="female">👩 Female</option>
              <option value="male">👨 Male</option>
            </select>
            <p className="form-hint">Choose the voice for the AI interviewer</p>
          </div>

          <div className="form-group">
            <label htmlFor="resume">Resume (PDF) - Optional:</label>
            {!resumeFile ? (
              <div className="file-upload-area">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading || parsingResume}
                  className="file-input"
                />
                <label htmlFor="resume" className="file-upload-label">
                  {parsingResume ? '⏳ Parsing resume...' : '📄 Upload Resume PDF'}
                </label>
                <p className="form-hint">Upload your resume for personalized interview questions</p>
              </div>
            ) : (
              <div className="resume-uploaded">
                <div className="resume-info">
                  <span className="resume-icon">📄</span>
                  <span className="resume-name">{resumeFileName}</span>
                  {resumeText && (
                    <span className="resume-status">✓ Parsed ({Math.round(resumeText.length / 100)} KB)</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  disabled={loading || parsingResume}
                  className="btn-remove-resume"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedRole || !userName.trim()}
            className="btn-primary"
          >
            {loading ? 'Starting Interview...' : 'Start Interview'}
          </button>
        </form>

        <div className="setup-info">
          <h3>💡 Tips:</h3>
          <ul>
            <li>You can use voice or text input during the interview</li>
            <li>Answer naturally, as you would in a real interview</li>
            <li>After the interview, you'll receive detailed feedback</li>
            <li>Try different roles to practice various scenarios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InterviewSetup

