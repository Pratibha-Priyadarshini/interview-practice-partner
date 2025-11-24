import React, { useState } from 'react'
import './CodeEditor.css'

function CodeEditor({ onCodeSubmit, sessionId, disabled, onClose }) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  const handleSubmit = () => {
    if (code.trim()) {
      onCodeSubmit(code, language)
      setCode('') // Clear after submission
    }
  }

  const handleClear = () => {
    setCode('')
  }

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'text', label: 'Plain Text' }
  ]

  return (
    <div className="code-editor-container">
      <div className="code-editor-header">
        <h3>📝 Code/Notes Editor</h3>
        <div className="editor-controls">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={disabled}
            className="language-select"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleClear}
            disabled={disabled || !code.trim()}
            className="btn-clear"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={disabled || !code.trim()}
            className="btn-submit-code"
          >
            Send to Interviewer
          </button>
          {onClose && (
            <button
              onClick={onClose}
              disabled={disabled}
              className="btn-close-editor"
              title="Close editor"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={disabled}
        placeholder="Type your code, notes, or solution here... The interviewer will be able to see this."
        className={`code-textarea ${language}`}
        rows={15}
      />
      <div className="editor-footer">
        <p className="editor-hint">
          💡 Tip: The interviewer can see what you type. Use this for code challenges, writing samples, or taking notes.
        </p>
      </div>
    </div>
  )
}

export default CodeEditor

