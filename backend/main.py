"""
Eightfold.ai Interview Practice Partner
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Verify API key is loaded
if not os.getenv("GROQ_API_KEY"):
    print("WARNING: GROQ_API_KEY not found in environment variables!")
    print("Please check your .env file")
else:
    print("[OK] Groq API key loaded successfully")

# Import routes
from auth_routes import router as auth_router
from interview_routes import router as interview_router
from reports_routes import router as reports_router
from db_config import init_db

app = FastAPI(
    title="Interview Practice Partner API",
    description="AI-powered interview practice agent with authentication",
    version="2.0.0"
)

# CORS middleware for frontend communication - MUST be before routes
# Allow both local development and production URLs
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://interview-practice-partner.onrender.com",  # Production backend
    "https://interview-practice-partner-1.onrender.com",  # Production frontend
    "https://*.onrender.com",  # Any Render subdomain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now (can restrict later)
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("[OK] Application started successfully")

# Include routers
app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(reports_router)

@app.get("/")
async def root():
    return {
        "message": "Interview Practice Partner API",
        "status": "running",
        "version": "2.0.0",
        "features": ["authentication", "interview_history", "reports"]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

