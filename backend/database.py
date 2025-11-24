"""
Simple file-based database for user management and interview history
For production, replace with PostgreSQL/MySQL
"""
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import hashlib

DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
INTERVIEWS_FILE = os.path.join(DATA_DIR, "interviews.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

def load_json(filepath: str) -> Dict:
    """Load JSON file or return empty dict"""
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return {}

def save_json(filepath: str, data: Dict):
    """Save data to JSON file"""
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def hash_password(password: str) -> str:
    """Simple password hashing (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

class Database:
    def __init__(self):
        self.users = load_json(USERS_FILE)
        self.interviews = load_json(INTERVIEWS_FILE)
    
    def save(self):
        """Save all data to files"""
        save_json(USERS_FILE, self.users)
        save_json(INTERVIEWS_FILE, self.interviews)
    
    # User operations
    def create_user(self, email: str, password: str, name: str, phone: str = "") -> Dict:
        """Create a new user"""
        if email in self.users:
            raise ValueError("User already exists")
        
        user_id = f"user_{len(self.users) + 1}"
        self.users[email] = {
            "user_id": user_id,
            "email": email,
            "password": hash_password(password),
            "name": name,
            "phone": phone,
            "created_at": datetime.now().isoformat(),
            "interview_count": 0
        }
        self.save()
        return {k: v for k, v in self.users[email].items() if k != 'password'}
    
    def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user and return user data"""
        if email not in self.users:
            return None
        
        user = self.users[email]
        if user['password'] == hash_password(password):
            return {k: v for k, v in user.items() if k != 'password'}
        return None
    
    def get_user(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        if email in self.users:
            return {k: v for k, v in self.users[email].items() if k != 'password'}
        return None
    
    def update_user(self, email: str, updates: Dict) -> Dict:
        """Update user profile"""
        if email not in self.users:
            raise ValueError("User not found")
        
        # Don't allow updating email or password through this method
        allowed_fields = ['name', 'phone']
        for field in allowed_fields:
            if field in updates:
                self.users[email][field] = updates[field]
        
        self.save()
        return {k: v for k, v in self.users[email].items() if k != 'password'}
    
    # Interview operations
    def save_interview(self, user_email: str, session_data: Dict, feedback: Dict) -> str:
        """Save interview and feedback"""
        interview_id = f"interview_{len(self.interviews) + 1}"
        
        self.interviews[interview_id] = {
            "interview_id": interview_id,
            "user_email": user_email,
            "session_data": session_data,
            "feedback": feedback,
            "created_at": datetime.now().isoformat()
        }
        
        # Update user interview count
        if user_email in self.users:
            self.users[user_email]['interview_count'] = self.users[user_email].get('interview_count', 0) + 1
        
        self.save()
        return interview_id
    
    def get_user_interviews(self, user_email: str) -> List[Dict]:
        """Get all interviews for a user"""
        user_interviews = []
        for interview_id, interview in self.interviews.items():
            if interview['user_email'] == user_email:
                user_interviews.append(interview)
        
        # Sort by date, newest first
        user_interviews.sort(key=lambda x: x['created_at'], reverse=True)
        return user_interviews
    
    def get_interview(self, interview_id: str) -> Optional[Dict]:
        """Get specific interview by ID"""
        return self.interviews.get(interview_id)

# Global database instance
db = Database()
