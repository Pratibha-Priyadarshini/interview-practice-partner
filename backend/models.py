"""
Database models for user authentication and interview history
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationship
    interviews = relationship("Interview", back_populates="user")

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, unique=True, index=True)
    
    # Interview details
    role = Column(String, nullable=False)
    interview_round = Column(String, nullable=False)  # technical/hr
    duration_minutes = Column(Integer, nullable=False)
    
    # Scores
    overall_score = Column(Integer, nullable=False)
    communication_score = Column(Integer, nullable=False)
    technical_score = Column(Integer, nullable=False)
    preparation_score = Column(Integer, nullable=False)
    
    # Feedback data (stored as JSON)
    strengths = Column(JSON, nullable=True)
    areas_for_improvement = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    detailed_analysis = Column(Text, nullable=True)
    detailed_feedback = Column(Text, nullable=True)
    
    # Video analysis
    video_analysis = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="interviews")
