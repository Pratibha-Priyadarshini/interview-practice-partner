"""
Interview Agent - Core logic for conducting mock interviews
"""
import os
import uuid
from typing import Dict, List, Optional
from datetime import datetime
from groq import Groq
import json

# Lazy initialization of Groq client
_client = None

def get_groq_client():
    """Get or create Groq client instance"""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        _client = Groq(api_key=api_key)
    return _client

# Interview role configurations
ROLE_CONFIGS = {
    "sales": {
        "name": "Sales Representative",
        "focus_areas": [
            "Customer relationship building",
            "Handling objections",
            "Product knowledge",
            "Closing techniques",
            "Communication skills"
        ],
        "question_types": [
            "situational",
            "behavioral",
            "role-play"
        ]
    },
    "engineer": {
        "name": "Software Engineer",
        "focus_areas": [
            "Technical problem-solving",
            "System design",
            "Coding proficiency",
            "Collaboration",
            "Learning ability"
        ],
        "question_types": [
            "technical",
            "system_design",
            "behavioral",
            "coding"
        ]
    },
    "data_analyst": {
        "name": "Data Analyst",
        "focus_areas": [
            "Data analysis and interpretation",
            "SQL and database queries",
            "Data visualization",
            "Statistical analysis",
            "Business insights"
        ],
        "question_types": [
            "technical",
            "analytical",
            "behavioral"
        ]
    },
    "product_manager": {
        "name": "Product Manager",
        "focus_areas": [
            "Product strategy",
            "Stakeholder management",
            "Prioritization",
            "User research",
            "Roadmap planning"
        ],
        "question_types": [
            "situational",
            "behavioral",
            "case_study"
        ]
    },
    "business_analyst": {
        "name": "Business Analyst",
        "focus_areas": [
            "Requirements gathering",
            "Process improvement",
            "Stakeholder communication",
            "Documentation",
            "Problem-solving"
        ],
        "question_types": [
            "situational",
            "behavioral",
            "analytical"
        ]
    },
    "ui_ux_designer": {
        "name": "UI/UX Designer",
        "focus_areas": [
            "User-centered design",
            "Design thinking",
            "Prototyping",
            "User research",
            "Visual design"
        ],
        "question_types": [
            "portfolio",
            "behavioral",
            "design_challenge"
        ]
    },
    "devops_engineer": {
        "name": "DevOps Engineer",
        "focus_areas": [
            "CI/CD pipelines",
            "Infrastructure as code",
            "Cloud platforms",
            "Automation",
            "Monitoring and logging"
        ],
        "question_types": [
            "technical",
            "system_design",
            "behavioral"
        ]
    },
    "ml_engineer": {
        "name": "ML/AI Engineer",
        "focus_areas": [
            "Machine learning algorithms",
            "Model training and deployment",
            "Data preprocessing",
            "Deep learning",
            "MLOps"
        ],
        "question_types": [
            "technical",
            "coding",
            "behavioral"
        ]
    },
    "mobile_developer": {
        "name": "Mobile App Developer",
        "focus_areas": [
            "Mobile development (iOS/Android)",
            "UI/UX implementation",
            "API integration",
            "Performance optimization",
            "App architecture"
        ],
        "question_types": [
            "technical",
            "coding",
            "behavioral"
        ]
    },
    "qa_engineer": {
        "name": "QA Engineer",
        "focus_areas": [
            "Test planning and strategy",
            "Automation testing",
            "Bug tracking",
            "Quality assurance",
            "Testing methodologies"
        ],
        "question_types": [
            "technical",
            "situational",
            "behavioral"
        ]
    },
    "project_manager": {
        "name": "Project Manager",
        "focus_areas": [
            "Project planning",
            "Team leadership",
            "Risk management",
            "Agile/Scrum",
            "Stakeholder communication"
        ],
        "question_types": [
            "situational",
            "behavioral",
            "leadership"
        ]
    },
    "marketing_manager": {
        "name": "Marketing Manager",
        "focus_areas": [
            "Marketing strategy",
            "Campaign management",
            "Analytics and metrics",
            "Brand management",
            "Digital marketing"
        ],
        "question_types": [
            "situational",
            "behavioral",
            "case_study"
        ]
    },
    "retail_associate": {
        "name": "Retail Associate",
        "focus_areas": [
            "Customer service",
            "Product knowledge",
            "Handling difficult situations",
            "Teamwork",
            "Sales skills"
        ],
        "question_types": [
            "situational",
            "behavioral",
            "customer_service"
        ]
    }
}


class InterviewAgent:
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}
        self.conversation_history: Dict[str, List[Dict]] = {}
        self.code_submissions: Dict[str, List[Dict]] = {}  # session_id -> list of code submissions
    
    def start_interview(self, role: str, user_name: str = "Candidate", voice_gender: str = "female", interview_round: str = "technical", duration_minutes: int = 30, resume_text: Optional[str] = None) -> Dict:
        """Initialize a new interview session"""
        if role not in ROLE_CONFIGS:
            raise ValueError(f"Invalid role: {role}. Available roles: {list(ROLE_CONFIGS.keys())}")
        
        session_id = str(uuid.uuid4())
        config = ROLE_CONFIGS[role]
        
        # Validate voice_gender
        if voice_gender not in ["male", "female"]:
            voice_gender = "female"
        
        # Validate interview_round
        if interview_round not in ["technical", "hr"]:
            interview_round = "technical"
        
        # Validate duration
        if duration_minutes not in [15, 30, 45, 60, 90]:
            duration_minutes = 30
        
        # Calculate target question count based on duration
        # Rough estimate: 2-3 minutes per question
        target_questions = {
            15: 7,   # 5-7 questions
            30: 12,  # 8-12 questions
            45: 15,  # 12-15 questions
            60: 20,  # 15-20 questions
            90: 25   # 20-25 questions
        }
        
        # Create session
        session = {
            "session_id": session_id,
            "role": role,
            "role_name": config["name"],
            "user_name": user_name,
            "voice_gender": voice_gender,
            "interview_round": interview_round,
            "duration_minutes": duration_minutes,
            "target_questions": target_questions[duration_minutes],
            "resume_text": resume_text,
            "started_at": datetime.now().isoformat(),
            "status": "active",
            "question_count": 0,
            "conversation_turns": 0
        }
        
        self.sessions[session_id] = session
        self.conversation_history[session_id] = []
        
        # Generate greeting and first question
        round_type = "technical" if interview_round == "technical" else "HR"
        greeting_messages = [
            {"role": "system", "content": f"You are a professional, friendly interviewer conducting a {round_type} round {config['name']} interview. Be warm and conversational."},
            {"role": "user", "content": self._build_greeting_prompt(role, config, user_name, interview_round, resume_text)}
        ]
        first_question = self._call_llm(greeting_messages, temperature=0.8, max_tokens=150).strip()
        
        # Create a simple, professional greeting
        greeting = f"Hello {user_name}, welcome to your {config['name']} {round_type} interview. I'm excited to learn more about you today."
        
        # Store initial interaction
        self.conversation_history[session_id].append({
            "role": "assistant",
            "content": greeting + "\n\n" + first_question,
            "timestamp": datetime.now().isoformat()
        })
        
        session["greeting"] = greeting
        session["first_question"] = first_question
        
        return session
    
    def process_message(self, session_id: str, user_message: str, is_voice: bool = False) -> Dict:
        """Process user message and generate interviewer response"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        if session["status"] != "active":
            raise ValueError(f"Session {session_id} is not active")
        
        # Store user message
        self.conversation_history[session_id].append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.now().isoformat(),
            "is_voice": is_voice
        })
        
        # Build conversation messages for OpenAI API
        role = session["role"]
        config = ROLE_CONFIGS[role]
        conversation_messages = self._build_conversation_messages(
            session,
            config,
            user_message
        )
        
        # Get interviewer response using proper message format (higher temp for natural conversation)
        interviewer_response = self._call_llm(conversation_messages, temperature=0.9, max_tokens=150)
        
        # Store assistant response
        self.conversation_history[session_id].append({
            "role": "assistant",
            "content": interviewer_response,
            "timestamp": datetime.now().isoformat()
        })
        
        # Update session stats
        session["conversation_turns"] += 1
        session["question_count"] += 1
        
        # Check if interview should continue based on target questions
        target_questions = session.get("target_questions", 12)
        should_continue = session["question_count"] < target_questions
        
        return {
            "response": interviewer_response,
            "session_id": session_id,
            "question_count": session["question_count"],
            "should_continue": should_continue,
            "interview_status": "active"
        }
    
    def end_interview(self, session_id: str):
        """Mark interview session as ended"""
        if session_id in self.sessions:
            self.sessions[session_id]["status"] = "ended"
            self.sessions[session_id]["ended_at"] = datetime.now().isoformat()
    
    def submit_code(self, session_id: str, code: str, language: str = "text") -> Dict:
        """Submit code for review and get interviewer feedback"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        if session["status"] != "active":
            raise ValueError(f"Session {session_id} is not active")
        
        # Store code submission
        if session_id not in self.code_submissions:
            self.code_submissions[session_id] = []
        
        code_submission = {
            "code": code,
            "language": language,
            "timestamp": datetime.now().isoformat()
        }
        self.code_submissions[session_id].append(code_submission)
        
        # Generate code review prompt
        role = session["role"]
        config = ROLE_CONFIGS[role]
        review_prompt = self._build_code_review_prompt(session, config, code, language)
        
        # Get interviewer response about the code (allow more tokens for code review)
        review_response = self._call_llm([{
            "role": "system",
            "content": f"You are an experienced technical interviewer conducting an ONGOING mock interview for the {config['name']} position. Review code submissions briefly, then continue the interview with another question. This is NOT the end of the interview. Speak directly to the candidate (use 'you'), not about them (don't say 'the candidate')."
        }, {
            "role": "user",
            "content": review_prompt
        }], temperature=0.7, max_tokens=300)
        
        # Store code and review in conversation history
        self.conversation_history[session_id].append({
            "role": "user",
            "content": f"[Code Submission in {language}]\n\n```{language}\n{code}\n```",
            "timestamp": datetime.now().isoformat(),
            "isCode": True
        })
        
        self.conversation_history[session_id].append({
            "role": "assistant",
            "content": review_response,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "review": review_response,
            "session_id": session_id,
            "submission_count": len(self.code_submissions[session_id])
        }
    
    def _build_code_review_prompt(self, session: Dict, config: Dict, code: str, language: str) -> str:
        """Build prompt for code review"""
        role = session["role"]
        user_name = session["user_name"]
        
        return f"""The candidate has submitted the following code in {language}:

```{language}
{code}
```

Please review this code submission as part of an ONGOING {config['name']} interview. Consider:
- Code correctness and logic
- Code quality and best practices
- Efficiency and optimization
- Readability and maintainability
- Edge cases handling

Provide constructive feedback in 2-3 sentences. Then ask a follow-up question to CONTINUE the interview.

IMPORTANT: 
- This is NOT the end of the interview
- After reviewing the code, ask another interview question
- Keep the conversation going naturally
- Don't give final feedback or say "candidate" - you're talking TO them, not ABOUT them

Example: "Good work on [aspect]. However, [improvement]. Now, let me ask you about [next topic]..."""
    
    def get_interview_status(self, session_id: str) -> Dict:
        """Get current status of interview session"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id].copy()
        session["message_count"] = len(self.conversation_history.get(session_id, []))
        session["code_submission_count"] = len(self.code_submissions.get(session_id, []))
        return session
    
    def _build_greeting_prompt(self, role: str, config: Dict, user_name: str, interview_round: str, resume_text: Optional[str] = None) -> str:
        """Build prompt for interview greeting and first question"""
        
        round_context = ""
        if interview_round == "technical":
            round_context = "This is a TECHNICAL round. Focus on technical skills, problem-solving, coding abilities, and technical knowledge."
        else:
            round_context = "This is an HR round. Focus on behavioral questions, soft skills, culture fit, work experience, and career goals."
        
        if resume_text:
            resume_summary = resume_text[:1000] if len(resume_text) > 1000 else resume_text
            base_prompt = f"""You are starting a {config['name']} {interview_round} interview with {user_name}.

Their resume: {resume_summary}

Generate ONLY the opening question (no greeting needed). Ask about something SPECIFIC from their resume.

For technical round: Ask about a technical project, skill, or challenge they mentioned.
For HR round: Ask about their work experience, achievements, or career journey.

Example: "I noticed you worked on [specific project]. Can you walk me through your role and the key challenges you faced?"

Keep it conversational and specific. One question only."""
        else:
            if interview_round == "technical":
                base_prompt = f"""You are starting a {config['name']} technical interview with {user_name}.

Generate ONLY the opening question (no greeting needed). Ask about their technical background or experience.

Example: "Can you tell me about your experience with [relevant technology]?"

Keep it conversational. One question only."""
            else:
                base_prompt = f"""You are starting a {config['name']} HR interview with {user_name}.

Generate ONLY the opening question (no greeting needed). Ask them to introduce themselves.

Example: "Could you start by telling me a bit about yourself and what interests you about this role?"

Keep it conversational. One question only."""
        
        return base_prompt
    
    def _build_conversation_messages(self, session: Dict, config: Dict, user_message: str) -> List[Dict]:
        """Build conversation messages for OpenAI API"""
        role = session["role"]
        user_name = session["user_name"]
        interview_round = session.get("interview_round", "technical")
        duration_minutes = session.get("duration_minutes", 30)
        target_questions = session.get("target_questions", 12)
        resume_text = session.get("resume_text")
        history = self.conversation_history[session["session_id"]]
        question_count = session['question_count']
        code_submission_count = len(self.code_submissions.get(session["session_id"], []))
        
        # Build system message based on interview round
        if interview_round == "technical":
            round_instructions = """TECHNICAL ROUND - Focus on:
- Technical skills and knowledge
- Problem-solving abilities
- Coding proficiency (ask coding questions)
- System design and architecture
- Technical challenges they've faced
- How they debug and optimize
- Technologies and tools they use"""
        else:
            round_instructions = """HR ROUND - Focus on:
- Behavioral questions (STAR method)
- Soft skills and communication
- Culture fit and values
- Career goals and motivation
- Work experience and achievements
- Teamwork and conflict resolution
- Strengths and weaknesses
- Why they want this role"""
        
        # Calculate interview progress
        progress_percent = (question_count / target_questions) * 100
        
        # Determine pacing guidance
        if progress_percent < 30:
            pacing = "Early stage - Ask foundational questions"
        elif progress_percent < 60:
            pacing = "Mid-stage - Dive deeper into their experience"
        elif progress_percent < 85:
            pacing = "Late stage - Ask challenging questions"
        else:
            pacing = "Final questions - Wrap up with 1-2 closing questions"
        
        system_content = f"""You are interviewing {user_name} for a {config['name']} position.

{round_instructions}

INTERVIEW PACING:
- Duration: {duration_minutes} minutes
- Target questions: {target_questions}
- Current question: #{question_count + 1}
- Progress: {progress_percent:.0f}%
- Stage: {pacing}

Instructions:
- Listen to what the candidate says and respond naturally
- Acknowledge their answer before asking the next question
- Ask follow-up questions based on their responses
- Keep responses short (2-3 sentences)
- Be conversational and friendly
- Pace the interview appropriately for the time allocated"""
        
        # For technical round, prompt for coding questions
        if interview_round == "technical" and role == "engineer" and question_count >= 2 and code_submission_count == 0:
            system_content += """

IMPORTANT: After 2-3 questions, ask a CODING question. Tell the candidate:
"Now let's move to a coding challenge. Please use the code editor on the screen to write your solution."

Example coding questions:
- "Write a function to reverse a string"
- "Implement a function to check if a string is a palindrome"
- "Write code to find the largest number in an array"
- "Implement a simple function to validate an email address"

Keep it simple and practical."""
        
        # Remind about code editor if they haven't used it yet
        if interview_round == "technical" and role == "engineer" and question_count >= 4 and code_submission_count == 0:
            system_content += """

REMINDER: The candidate hasn't used the code editor yet. Encourage them to write code for the technical question."""
        
        if resume_text:
            resume_summary = resume_text[:800] if len(resume_text) > 800 else resume_text
            system_content += f"""

IMPORTANT - Candidate's Resume:
{resume_summary}

Mix resume-based questions with role-specific questions:
- Ask about their specific experiences mentioned in the resume
- Reference their skills, projects, or achievements
- Ask how their background relates to this {config['name']} role
- Alternate between resume questions and general interview questions"""
        
        # Start with system message
        messages = [{"role": "system", "content": system_content}]
        
        # Add conversation history (last 10 messages for context)
        recent_history = history[-10:] if len(history) > 10 else history
        
        for msg in recent_history:
            openai_role = "assistant" if msg["role"] == "assistant" else "user"
            messages.append({
                "role": openai_role,
                "content": msg["content"]
            })
        
        return messages
    
    def _get_role_specific_guidance(self, role: str) -> str:
        """Get specific guidance for each role"""
        guidance = {
            "sales": """- Ask about their sales process and methodology
   - Probe for specific examples of deals they've closed
   - Ask how they handle objections and difficult customers
   - Explore their relationship-building strategies
   - Ask about their biggest sales win and what made it successful
   - Inquire about how they research prospects and prepare for calls""",
            
            "engineer": """- Ask about specific technical projects they've worked on
   - Probe their problem-solving approach with real scenarios
   - Ask about technologies, languages, and frameworks they've used
   - Explore how they debug and optimize code
   - Ask about collaboration with other engineers
   - Inquire about their learning process for new technologies
   - Present technical challenges and ask how they'd solve them""",
            
            "retail_associate": """- Ask about customer service experiences and difficult situations
   - Probe for examples of going above and beyond for customers
   - Ask how they handle angry or upset customers
   - Explore their product knowledge and how they learn about products
   - Ask about teamwork and supporting colleagues
   - Inquire about their sales approach and upselling techniques"""
        }
        return guidance.get(role, "- Ask relevant questions for this role")
    
    
    def _call_llm(self, messages: List[Dict], temperature: float = 0.7, max_tokens: int = 200) -> str:
        """Call LLM API with conversation messages (tries Groq first, then Gemini as fallback)"""
        try:
            client = get_groq_client()
            
            # Debug: Print the last user message
            user_messages = [m for m in messages if m["role"] == "user"]
            if user_messages:
                print(f"\n[DEBUG] Last user message: {user_messages[-1]['content'][:100]}...")
            
            # Try Groq first
            try:
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                ai_response = response.choices[0].message.content.strip()
                print(f"[DEBUG] Groq AI response: {ai_response[:100]}...")
                return ai_response
                
            except Exception as groq_error:
                print(f"[WARNING] Groq API failed: {groq_error}")
                print("[INFO] Trying Gemini as fallback...")
                
                # Try Gemini as fallback
                gemini_api_key = os.getenv("GEMINI_API_KEY", "")
                if gemini_api_key:
                    try:
                        import google.generativeai as genai
                        genai.configure(api_key=gemini_api_key)
                        model = genai.GenerativeModel('gemini-pro')
                        
                        # Convert messages to Gemini format
                        prompt = ""
                        for msg in messages:
                            if msg["role"] == "system":
                                prompt += f"System: {msg['content']}\n\n"
                            elif msg["role"] == "user":
                                prompt += f"User: {msg['content']}\n\n"
                            elif msg["role"] == "assistant":
                                prompt += f"Assistant: {msg['content']}\n\n"
                        
                        prompt += "Assistant:"
                        
                        response = model.generate_content(prompt)
                        ai_response = response.text.strip()
                        print(f"[DEBUG] Gemini AI response: {ai_response[:100]}...")
                        return ai_response
                        
                    except Exception as gemini_error:
                        print(f"[ERROR] Gemini also failed: {gemini_error}")
                        raise groq_error  # Raise original error
                else:
                    raise groq_error
            
        except Exception as e:
            print(f"[ERROR] All LLM APIs failed: {e}")
            import traceback
            traceback.print_exc()
            # Fallback response if all APIs fail
            return "That's interesting. Can you elaborate on that? What specific experience do you have in this area?"

