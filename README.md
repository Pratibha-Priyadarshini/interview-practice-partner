# 🎯 Interview Practice Partner - AI-Powered Mock Interview Platform

An intelligent, enterprise-grade mock interview platform that provides realistic interview practice with real-time AI feedback, voice interaction, video analysis, and comprehensive performance reports.

## 🌐 Live Demo

- **Frontend**: https://interview-practice-partner-1.onrender.com
- **Backend API**: https://interview-practice-partner.onrender.com
- **API Documentation**: https://interview-practice-partner.onrender.com/docs

> **Note**: Free tier services may take 30-60 seconds to wake up on first request.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Design Decisions](#design-decisions)
- [Setup Instructions](#setup-instructions)
- [User Personas & Demo Scenarios](#user-personas--demo-scenarios)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

---

## ✨ Features

### Core Capabilities
- **🎤 Voice-Based Interviews**: Natural conversation flow with speech-to-text and text-to-speech
- **💻 Multi-Role Support**: 13+ professional roles (Software Engineer, Data Analyst, Product Manager, etc.)
- **📹 Video Analysis**: Real-time body language, eye contact, and confidence assessment using Gemini Vision AI
- **📝 Code Editor**: Integrated code submission and review for technical interviews
- **📊 Comprehensive Feedback**: Multi-dimensional scoring with actionable recommendations
- **🔐 Secure Authentication**: JWT-based user authentication with encrypted passwords
- **📈 Interview History**: Track progress over time with detailed reports
- **🎨 Dual Themes**: Professional dark mode and minimalistic light mode
- **📱 Responsive Design**: Landscape-optimized for widescreen displays

### Intelligent Features
- **Resume-Based Questions**: Upload PDF resume for personalized interview questions
- **Adaptive Questioning**: AI adjusts difficulty based on candidate responses
- **Malpractice Detection**: Identifies suspicious behavior during interviews
- **Real-Time Transcription**: Live speech-to-text with automatic silence detection
- **Performance Analytics**: Visual charts and graphs for score breakdown

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Interview   │  │   Reports    │     │
│  │   (3 Tabs)   │  │   Session    │  │   History    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                    ┌───────▼────────┐                        │
│                    │  Auth Context  │                        │
│                    │ Theme Context  │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ REST API (JWT)
┌────────────────────────────▼─────────────────────────────────┐
│                    Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Routes  │  │  Interview   │  │   Reports    │      │
│  │   (JWT)      │  │   Routes     │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘               │
│                            │                                   │
│         ┌──────────────────┴──────────────────┐              │
│         │                                      │               │
│  ┌──────▼────────┐                   ┌────────▼────────┐    │
│  │  Interview    │                   │     Video       │    │
│  │    Agent      │                   │   Analyzer      │    │
│  │  (Groq AI)    │                   │ (Gemini Vision) │    │
│  └───────────────┘                   └─────────────────┘    │
│         │                                      │               │
│         └──────────────────┬──────────────────┘               │
│                            │                                   │
│                   ┌────────▼────────┐                         │
│                   │   SQLAlchemy    │                         │
│                   │   (SQLite DB)   │                         │
│                   └─────────────────┘                         │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: JWT tokens for secure session management
2. **Interview Start**: User selects role, round, duration, and optionally uploads resume
3. **Voice Interaction**: Real-time speech recognition → AI processing → Text-to-speech response
4. **Video Analysis**: Frames captured every 5 seconds → Gemini Vision API → Analysis stored
5. **Code Submission**: Code editor → Backend review → AI feedback
6. **Interview End**: Comprehensive analysis → Database storage → Visual feedback report

---

## 🎯 Design Decisions

### 1. **Voice-First Approach**
**Decision**: Make voice interaction the primary mode, with text as fallback.

**Reasoning**:
- Simulates real interview environment more accurately
- Reduces cognitive load on candidates
- Enables natural conversation flow
- Automatic silence detection prevents interruptions

**Implementation**:
- Web Speech API for speech recognition
- Speech Synthesis API for text-to-speech
- Automatic mode switching based on user preference
- Echo prevention during AI speech

### 2. **Groq AI for Interview Agent**
**Decision**: Use Groq's Llama 3.3 70B model for interview conversations.

**Reasoning**:
- **Speed**: Ultra-fast inference (500+ tokens/sec) for real-time responses
- **Quality**: Large 70B parameter model provides intelligent, contextual questions
- **Cost**: Free tier with generous limits
- **Reliability**: Stable API with high uptime

**Alternative Considered**: OpenAI GPT-4 (rejected due to cost and slower response times)

### 3. **Gemini Vision for Video Analysis**
**Decision**: Use Google's Gemini 2.5 Flash for video frame analysis.

**Reasoning**:
- **Multimodal**: Native support for image + text analysis
- **Free Tier**: Generous free quota for development
- **Accuracy**: Excellent at detecting facial expressions and body language
- **Speed**: Fast enough for real-time analysis (5-second intervals)

**Implementation**:
- Frames captured every 5 seconds to balance accuracy and API usage
- Analysis includes: eye contact, confidence, body language, malpractice detection
- Results aggregated for comprehensive report

### 4. **SQLite Database**
**Decision**: Use SQLite for data persistence.

**Reasoning**:
- **Simplicity**: No separate database server required
- **Portability**: Single file database, easy to backup
- **Performance**: Sufficient for single-user or small team usage
- **Zero Configuration**: Works out of the box

**Migration Path**: Can easily migrate to PostgreSQL for production scale

### 5. **JWT Authentication**
**Decision**: Implement JWT-based authentication with Argon2 password hashing.

**Reasoning**:
- **Stateless**: No server-side session storage required
- **Scalable**: Easy to distribute across multiple servers
- **Secure**: Industry-standard token-based auth
- **Argon2**: Winner of Password Hashing Competition, resistant to GPU attacks

### 6. **Dual Theme System**
**Decision**: Implement light (pink) and dark (blue) themes with CSS variables.

**Reasoning**:
- **User Preference**: Different users prefer different themes
- **Accessibility**: Reduces eye strain in different lighting conditions
- **Professional**: Dark theme for serious practice, light theme for casual use
- **Brand Identity**: Pink for friendly/approachable, blue for professional/technical

### 7. **Landscape-Optimized Layout**
**Decision**: Design primarily for widescreen displays (1400px+).

**Reasoning**:
- **Target Audience**: Professionals typically use laptops/desktops for interview prep
- **Information Density**: More space for feedback, charts, and analysis
- **Professional Context**: Matches actual interview setup (laptop/desktop)
- **Responsive Fallback**: Still works on smaller screens with adaptive layout

### 8. **Real-Time Feedback vs. Post-Interview**
**Decision**: Provide feedback only after interview completion.

**Reasoning**:
- **Realistic**: Matches real interview experience (no mid-interview feedback)
- **Focus**: Prevents distraction during interview
- **Comprehensive**: Allows holistic analysis of entire performance
- **Learning**: Encourages self-reflection before seeing results

---

## 🚀 Setup Instructions

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd interview-practice-partner
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your API keys:
# GROQ_API_KEY=your_groq_key_here
# GEMINI_API_KEY=your_gemini_key_here
# SECRET_KEY=generate_with_python_generate_secret_key.py

# Generate secret key
python generate_secret_key.py

# Start backend server
python main.py
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Get API Keys

#### Groq API Key (Required for interviews)
1. Visit: https://console.groq.com/
2. Sign up for free account
3. Navigate to API Keys section
4. Create new API key
5. Copy and paste into `backend/.env`

#### Gemini API Key (Optional for video analysis)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Copy and paste into `backend/.env`

### 5. Access Application

1. Open browser to `http://localhost:5173`
2. Register a new account
3. Login with credentials
4. Start practicing interviews!

---

## 👥 User Personas & Demo Scenarios

### 1. **The Confused User** (Unsure what they want)

**Scenario**: User doesn't know which role to practice for.

**System Behavior**:
- Dashboard provides clear role selection with 13+ options
- Each role has descriptive labels (e.g., "Software Engineer", "Data Analyst")
- Interview round selection (HR vs Technical) guides user
- Resume upload option helps personalize questions
- System adapts questions based on user's responses

**Demo Flow**:
1. User logs in, sees dashboard
2. Browses available roles
3. Selects "Software Engineer" → "Technical Round"
4. Uploads resume (optional)
5. System generates personalized questions based on resume
6. Interview adapts to user's skill level

### 2. **The Efficient User** (Wants quick results)

**Scenario**: User wants to practice quickly and get immediate feedback.

**System Behavior**:
- One-click interview start from dashboard
- Voice mode enabled by default for fastest interaction
- Automatic silence detection (no manual submission needed)
- Quick interview durations available (15 minutes)
- Instant feedback report after completion
- Visual charts for quick score understanding

**Demo Flow**:
1. Login → Dashboard → Interview Tab
2. Select role → Click "Start Interview" (< 10 seconds)
3. Voice conversation flows naturally
4. Interview completes in 15 minutes
5. Comprehensive feedback displayed immediately
6. Visual graphs show scores at a glance

### 3. **The Chatty User** (Frequently goes off topic)

**Scenario**: User tends to ramble or go off-topic during responses.

**System Behavior**:
- AI interviewer gently redirects to relevant topics
- Feedback includes "Stay focused on the question" in areas for improvement
- Communication score reflects clarity and conciseness
- Recommendations suggest STAR method for structured responses
- System doesn't penalize personality, but guides toward better answers

**Demo Flow**:
1. User starts interview
2. Gives long, rambling answer about personal life
3. AI responds: "That's interesting! Let's focus on your technical experience..."
4. Continues with relevant follow-up question
5. Feedback notes: "Consider more concise, focused responses"
6. Recommendations include: "Practice STAR method"

### 4. **The Edge Case User** (Invalid inputs/Off-topic/Beyond capabilities)

**Scenario A**: User provides invalid inputs

**System Behavior**:
- Form validation prevents invalid role selection
- Resume upload validates PDF format
- Duration must be between 15-60 minutes
- Clear error messages guide user to correct input

**Scenario B**: User goes completely off-topic

**System Behavior**:
- AI acknowledges but redirects: "I appreciate your thoughts, but let's get back to the interview..."
- System maintains professional tone
- Doesn't break character or get confused
- Feedback notes communication issues

**Scenario C**: User requests beyond bot's capabilities

**Example**: "Can you give me a job?" or "Hack into company database"

**System Behavior**:
- AI politely declines: "I'm here to help you practice interviews, not to..."
- Redirects to interview context
- Maintains boundaries professionally
- Doesn't attempt tasks outside scope

**Demo Flow**:
1. User asks: "Can you write my resume for me?"
2. AI: "I'm designed to help you practice interviews. I can review code you write during technical questions, but I can't write your resume. Let's continue with the interview..."
3. User submits empty code
4. System: "Please write some code before submitting"
5. User uploads .txt file instead of PDF
6. System: "Please upload a PDF file"

---

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client for API calls
- **Web Speech API**: Speech recognition and synthesis
- **CSS Variables**: Dynamic theming system

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Lightweight database
- **Groq AI**: Interview conversation engine
- **Gemini Vision**: Video frame analysis
- **JWT**: Authentication tokens
- **Argon2**: Password hashing
- **PyPDF2**: Resume parsing

### DevOps
- **Git**: Version control
- **Python venv**: Virtual environment
- **npm**: Package management

---

## 📁 Project Structure

```
interview-practice-partner/
├── backend/
│   ├── __pycache__/          # Python cache
│   ├── venv/                 # Virtual environment
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Example environment file
│   ├── auth.py               # JWT authentication logic
│   ├── auth_routes.py        # Auth API endpoints
│   ├── config.py             # Configuration settings
│   ├── database.py           # Database connection (legacy)
│   ├── db_config.py          # Database configuration
│   ├── feedback_analyzer.py  # Interview feedback generation
│   ├── interview_agent.py    # AI interview conversation
│   ├── interview_app.db      # SQLite database file
│   ├── interview_routes.py   # Interview API endpoints
│   ├── main.py               # FastAPI application entry
│   ├── models.py             # SQLAlchemy database models
│   ├── reports_routes.py     # Reports API endpoints
│   ├── requirements.txt      # Python dependencies
│   └── video_analyzer.py     # Gemini video analysis
│
├── frontend/
│   ├── node_modules/         # npm packages
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── CodeEditor.css
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   │   ├── FeedbackDisplay.jsx
│   │   │   ├── FeedbackDisplay.css
│   │   │   ├── InterviewSession.jsx
│   │   │   ├── InterviewSession.css
│   │   │   ├── InterviewSetup.jsx
│   │   │   ├── InterviewSetup.css
│   │   │   ├── InterviewTab.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── ProfileTab.jsx
│   │   │   ├── ProfileTab.css
│   │   │   ├── Register.jsx
│   │   │   ├── Register.css
│   │   │   ├── ReportsTab.jsx
│   │   │   └── ReportsTab.css
│   │   ├── context/          # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css           # App styles
│   │   ├── index.css         # Global styles & themes
│   │   └── main.jsx          # React entry point
│   ├── index.html            # HTML template
│   ├── package.json          # npm dependencies
│   ├── package-lock.json     # npm lock file
│   └── vite.config.js        # Vite configuration
│
├── .gitignore                # Git ignore rules
├── .vscode/                  # VS Code settings
├── generate_secret_key.py    # Secret key generator
├── GEMINI_SETUP.md          # Gemini API setup guide
├── QUICKSTART.md            # Quick start guide
├── README.md                # This file
├── setup_auth.bat           # Windows auth setup script
├── setup_backend.bat        # Windows backend setup script
├── setup_frontend.bat       # Windows frontend setup script
├── setup.sh                 # Unix setup script
├── test_application.bat     # Windows test script
└── TROUBLESHOOTING.md       # Troubleshooting guide
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**: Same as register

### Interview Endpoints

#### POST `/api/interview/start`
Start a new interview session.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "role": "software_engineer",
  "interview_round": "technical",
  "duration_minutes": 30,
  "voice_gender": "female",
  "resume_text": "Optional resume content..."
}
```

**Response**:
```json
{
  "session_id": "uuid-string",
  "role": "software_engineer",
  "greeting": "Hello! I'm excited to interview you...",
  "first_question": "Tell me about your experience..."
}
```

#### POST `/api/interview/message`
Send message during interview.

**Request Body**:
```json
{
  "session_id": "uuid-string",
  "message": "I have 5 years of experience...",
  "is_voice": true
}
```

**Response**:
```json
{
  "response": "That's great! Can you tell me more about...",
  "should_continue": true
}
```

#### POST `/api/interview/video-frame`
Submit video frame for analysis.

**Request Body**:
```json
{
  "session_id": "uuid-string",
  "image_base64": "base64-encoded-image",
  "current_question": "Tell me about..."
}
```

**Response**:
```json
{
  "analysis": {
    "eye_contact": "good",
    "confidence_level": "high",
    "body_language": "confident"
  }
}
```

#### POST `/api/interview/end`
End interview and get feedback.

**Request Body**:
```json
{
  "session_id": "uuid-string"
}
```

**Response**:
```json
{
  "overall_score": 8.5,
  "communication_score": 9.0,
  "technical_score": 8.0,
  "preparation_score": 8.5,
  "strengths": ["Clear communication", "Good examples"],
  "areas_for_improvement": ["More technical depth"],
  "recommendations": ["Practice system design"],
  "video_analysis": {
    "total_frames_analyzed": 12,
    "overall_eye_contact": "good",
    "average_confidence": "high"
  }
}
```

### Reports Endpoints

#### GET `/api/reports/history`
Get user's interview history.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
[
  {
    "id": 1,
    "role": "software_engineer",
    "interview_round": "technical",
    "overall_score": 8.5,
    "completed_at": "2025-11-24T10:30:00"
  }
]
```

#### GET `/api/reports/{interview_id}`
Get detailed report for specific interview.

**Response**: Same as interview end response

---

## 🎥 Demo Video

A 10-minute demo video showcasing:
- Multiple user personas (Confused, Efficient, Chatty, Edge Case)
- Voice interaction and natural conversation
- Video analysis in action
- Code submission and review
- Comprehensive feedback reports
- Theme switching
- Interview history

**Video Link**: [To be added after recording]

---

## 🔒 Security Considerations

- **Password Hashing**: Argon2 algorithm (winner of Password Hashing Competition)
- **JWT Tokens**: Secure, stateless authentication
- **Environment Variables**: Sensitive data not in codebase
- **Input Validation**: All user inputs validated
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **CORS Configuration**: Restricted to frontend origin

---

## 🚀 Future Enhancements

- **Multi-language Support**: Interviews in multiple languages
- **Live Coding Challenges**: Real-time code execution and testing
- **Peer Review**: Share interview recordings with mentors
- **Mobile App**: Native iOS/Android applications
- **Advanced Analytics**: ML-based performance predictions
- **Interview Scheduling**: Calendar integration for practice sessions
- **Team Features**: Company accounts with multiple users
- **Custom Question Banks**: Upload your own interview questions

---

## 📝 License

This project is created for educational purposes as part of the Eightfold AI Agent Challenge.

---

## 👨‍💻 Author

Created with ❤️ for the Eightfold AI Agent Challenge 2025

---

## 🙏 Acknowledgments

- **Groq**: For providing fast, free AI inference
- **Google Gemini**: For multimodal AI capabilities
- **FastAPI**: For excellent Python web framework
- **React**: For powerful UI development
- **Eightfold AI**: For organizing this challenge

---

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [QUICKSTART.md](QUICKSTART.md)
3. Check API documentation above

---

**Built for Eightfold AI Agent Challenge 2025** 🚀
