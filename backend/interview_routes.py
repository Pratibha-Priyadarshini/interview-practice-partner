"""
Protected interview routes - linked to authenticated users
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import PyPDF2
import io

from models import User, Interview
from db_config import get_db
from auth import get_current_user
from interview_agent import InterviewAgent
from feedback_analyzer import FeedbackAnalyzer
from video_analyzer import VideoAnalyzer

router = APIRouter(prefix="/api/interview", tags=["interview"])

# Initialize services
interview_agent = InterviewAgent()
video_analyzer = VideoAnalyzer(interview_agent=interview_agent)
feedback_analyzer = FeedbackAnalyzer(interview_agent=interview_agent, video_analyzer=video_analyzer)

# Request models
class InterviewStartRequest(BaseModel):
    role: str
    interview_round: Optional[str] = "technical"
    duration_minutes: Optional[int] = 30
    voice_gender: Optional[str] = "female"
    resume_text: Optional[str] = None

class MessageRequest(BaseModel):
    message: str
    session_id: str
    is_voice: bool = False

class InterviewEndRequest(BaseModel):
    session_id: str

class VideoFrameRequest(BaseModel):
    session_id: str
    image_base64: str
    current_question: Optional[str] = ""

class CodeSubmissionRequest(BaseModel):
    session_id: str
    code: str
    language: str = "text"

@router.get("/roles")
async def get_available_roles():
    """Get list of available interview roles"""
    roles = [
        "sales", "engineer", "data_analyst", "product_manager",
        "business_analyst", "ui_ux_designer", "devops_engineer",
        "ml_engineer", "mobile_developer", "qa_engineer",
        "project_manager", "marketing_manager", "retail_associate"
    ]
    return {"roles": roles}

@router.post("/resume/parse")
async def parse_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Parse PDF resume and extract text"""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    contents = await file.read()
    
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        resume_text = ""
        
        for page in pdf_reader.pages:
            resume_text += page.extract_text() + "\n"
        
        resume_text = resume_text.strip()
        
        if not resume_text or len(resume_text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract meaningful text from PDF"
            )
        
        if len(resume_text) > 8000:
            resume_text = resume_text[:8000] + "\n[... resume truncated ...]"
        
        return {
            "resume_text": resume_text,
            "file_name": file.filename,
            "text_length": len(resume_text)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")

@router.post("/start")
async def start_interview(
    request: InterviewStartRequest,
    current_user: User = Depends(get_current_user)
):
    """Start a new interview session"""
    try:
        session = interview_agent.start_interview(
            role=request.role,
            user_name=current_user.full_name,
            voice_gender=request.voice_gender,
            interview_round=request.interview_round,
            duration_minutes=request.duration_minutes,
            resume_text=request.resume_text
        )
        
        # Store user_id in session for later linking
        if session["session_id"] not in interview_agent.conversation_history:
            interview_agent.conversation_history[session["session_id"]] = []
        
        # Add user_id to session metadata
        session["user_id"] = current_user.id
        
        return {
            "session_id": session["session_id"],
            "role": session["role"],
            "interview_round": session.get("interview_round", "technical"),
            "duration_minutes": session.get("duration_minutes", 30),
            "greeting": session["greeting"],
            "first_question": session["first_question"],
            "voice_gender": session.get("voice_gender", "female"),
            "has_resume": bool(session.get("resume_text"))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message")
async def process_message(
    request: MessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Process user message and get AI response"""
    try:
        response = interview_agent.process_message(
            request.session_id,
            request.message,
            request.is_voice
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/end")
async def end_interview(
    request: InterviewEndRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End interview and save feedback to database"""
    try:
        # Generate feedback
        print(f"[DEBUG] Generating feedback for session: {request.session_id}")
        feedback = feedback_analyzer.analyze_interview(request.session_id)
        print(f"[DEBUG] Feedback generated successfully")
        
        # Get session info
        session_info = interview_agent.sessions.get(request.session_id, {})
        print(f"[DEBUG] Session info: {session_info}")
        
        # Save to database
        print(f"[DEBUG] Creating interview record...")
        interview_record = Interview(
            user_id=current_user.id,
            session_id=request.session_id,
            role=session_info.get("role", "unknown"),
            interview_round=session_info.get("interview_round", "technical"),
            duration_minutes=session_info.get("duration_minutes", 30),
            overall_score=feedback.get("overall_score", 0),
            communication_score=feedback.get("communication_score", 0),
            technical_score=feedback.get("technical_score", 0),
            preparation_score=feedback.get("preparation_score", 0),
            strengths=feedback.get("strengths", []),
            areas_for_improvement=feedback.get("areas_for_improvement", []),
            recommendations=feedback.get("recommendations", []),
            detailed_analysis=feedback.get("detailed_analysis", ""),
            detailed_feedback=feedback.get("detailed_feedback", ""),
            video_analysis=feedback.get("video_analysis", {}),
            completed_at=datetime.utcnow()
        )
        
        print(f"[DEBUG] Adding to database...")
        db.add(interview_record)
        print(f"[DEBUG] Committing...")
        db.commit()
        print(f"[DEBUG] Refreshing...")
        db.refresh(interview_record)
        print(f"[DEBUG] Interview saved with ID: {interview_record.id}")
        
        # Clean up session
        interview_agent.end_interview(request.session_id)
        
        return {
            **feedback,
            "interview_id": interview_record.id,
            "saved": True
        }
    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to end interview: {str(e)}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}/status")
async def get_interview_status(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get current interview status"""
    try:
        status = interview_agent.get_interview_status(session_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/video-frame")
async def analyze_video_frame(
    request: VideoFrameRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze a video frame from the candidate's webcam"""
    try:
        current_question = ""
        if request.session_id in interview_agent.conversation_history:
            history = interview_agent.conversation_history[request.session_id]
            for msg in reversed(history):
                if msg["role"] == "assistant":
                    current_question = msg["content"][:200]
                    break
        
        analysis = video_analyzer.analyze_frame(
            request.session_id,
            request.image_base64,
            current_question or request.current_question
        )
        
        return {
            "session_id": request.session_id,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/code-submission")
async def submit_code(
    request: CodeSubmissionRequest,
    current_user: User = Depends(get_current_user)
):
    """Submit code for review during interview"""
    try:
        result = interview_agent.submit_code(
            request.session_id,
            request.code,
            request.language
        )
        
        if request.session_id in interview_agent.conversation_history:
            history = interview_agent.conversation_history[request.session_id]
            last_message = history[-1] if history else None
            if last_message and last_message["role"] == "assistant":
                return {
                    "session_id": request.session_id,
                    "review": last_message["content"],
                    "submission_count": result["submission_count"],
                    "timestamp": datetime.now().isoformat()
                }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
