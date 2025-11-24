import React, { useState } from 'react';
import InterviewSetup from './InterviewSetup';
import InterviewSession from './InterviewSession';
import FeedbackDisplay from './FeedbackDisplay';
import { useAuth } from '../context/AuthContext';

const InterviewTab = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [sessionData, setSessionData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const { token } = useAuth();

  const handleInterviewStart = (data) => {
    setSessionData(data);
    setCurrentView('session');
  };

  const handleInterviewEnd = (feedback) => {
    setFeedbackData(feedback);
    setCurrentView('feedback');
  };

  const handleStartNew = () => {
    setSessionData(null);
    setFeedbackData(null);
    setCurrentView('setup');
  };

  return (
    <div>
      {currentView === 'setup' && (
        <InterviewSetup onStart={handleInterviewStart} token={token} />
      )}
      {currentView === 'session' && sessionData && (
        <InterviewSession
          sessionData={sessionData}
          onEnd={handleInterviewEnd}
          token={token}
        />
      )}
      {currentView === 'feedback' && feedbackData && (
        <FeedbackDisplay
          feedback={feedbackData}
          onStartNew={handleStartNew}
        />
      )}
    </div>
  );
};

export default InterviewTab;
