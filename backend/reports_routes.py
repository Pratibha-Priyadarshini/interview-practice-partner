"""
Reports routes - interview history and detailed reports
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel

from models import User, Interview
from db_config import get_db
from auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

# Response models
class InterviewSummary(BaseModel):
    id: int
    session_id: str
    role: str
    interview_round: str
    duration_minutes: int
    overall_score: int
    communication_score: int
    technical_score: int
    preparation_score: int
    completed_at: str
    
    class Config:
        from_attributes = True

class InterviewDetail(BaseModel):
    id: int
    session_id: str
    role: str
    interview_round: str
    duration_minutes: int
    overall_score: int
    communication_score: int
    technical_score: int
    preparation_score: int
    strengths: List[str]
    areas_for_improvement: List[str]
    recommendations: List[str]
    detailed_analysis: str
    detailed_feedback: str
    video_analysis: dict
    completed_at: str
    
    class Config:
        from_attributes = True

@router.get("/history", response_model=List[InterviewSummary])
async def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: Optional[int] = 50,
    offset: Optional[int] = 0
):
    """Get user's interview history"""
    interviews = db.query(Interview)\
        .filter(Interview.user_id == current_user.id)\
        .order_by(desc(Interview.completed_at))\
        .limit(limit)\
        .offset(offset)\
        .all()
    
    return [
        {
            "id": interview.id,
            "session_id": interview.session_id,
            "role": interview.role,
            "interview_round": interview.interview_round,
            "duration_minutes": interview.duration_minutes,
            "overall_score": interview.overall_score,
            "communication_score": interview.communication_score,
            "technical_score": interview.technical_score,
            "preparation_score": interview.preparation_score,
            "completed_at": interview.completed_at.isoformat()
        }
        for interview in interviews
    ]

@router.get("/{interview_id}", response_model=InterviewDetail)
async def get_interview_detail(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed interview report"""
    interview = db.query(Interview)\
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)\
        .first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return {
        "id": interview.id,
        "session_id": interview.session_id,
        "role": interview.role,
        "interview_round": interview.interview_round,
        "duration_minutes": interview.duration_minutes,
        "overall_score": interview.overall_score,
        "communication_score": interview.communication_score,
        "technical_score": interview.technical_score,
        "preparation_score": interview.preparation_score,
        "strengths": interview.strengths or [],
        "areas_for_improvement": interview.areas_for_improvement or [],
        "recommendations": interview.recommendations or [],
        "detailed_analysis": interview.detailed_analysis or "",
        "detailed_feedback": interview.detailed_feedback or "",
        "video_analysis": interview.video_analysis or {},
        "completed_at": interview.completed_at.isoformat()
    }

@router.get("/stats/summary")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics summary"""
    interviews = db.query(Interview)\
        .filter(Interview.user_id == current_user.id)\
        .all()
    
    if not interviews:
        return {
            "total_interviews": 0,
            "average_overall_score": 0,
            "average_communication_score": 0,
            "average_technical_score": 0,
            "average_preparation_score": 0,
            "best_score": 0,
            "recent_trend": "N/A"
        }
    
    total = len(interviews)
    avg_overall = sum(i.overall_score for i in interviews) / total
    avg_comm = sum(i.communication_score for i in interviews) / total
    avg_tech = sum(i.technical_score for i in interviews) / total
    avg_prep = sum(i.preparation_score for i in interviews) / total
    best = max(i.overall_score for i in interviews)
    
    # Calculate trend (last 3 vs previous 3)
    recent_trend = "N/A"
    if total >= 6:
        recent_3 = sum(i.overall_score for i in interviews[:3]) / 3
        previous_3 = sum(i.overall_score for i in interviews[3:6]) / 3
        if recent_3 > previous_3 + 5:
            recent_trend = "Improving"
        elif recent_3 < previous_3 - 5:
            recent_trend = "Declining"
        else:
            recent_trend = "Stable"
    
    return {
        "total_interviews": total,
        "average_overall_score": round(avg_overall, 1),
        "average_communication_score": round(avg_comm, 1),
        "average_technical_score": round(avg_tech, 1),
        "average_preparation_score": round(avg_prep, 1),
        "best_score": best,
        "recent_trend": recent_trend
    }
