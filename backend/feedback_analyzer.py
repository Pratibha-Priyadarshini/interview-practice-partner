"""
Feedback Analyzer - Analyzes interview performance and provides detailed feedback
"""
import os
from typing import Dict, List
from datetime import datetime
import json

# OpenAI is optional - only used as fallback
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Lazy initialization of OpenAI client
_feedback_client = None

def get_openai_client():
    """Get or create OpenAI client instance (optional)"""
    global _feedback_client
    if not OPENAI_AVAILABLE:
        return None
    if _feedback_client is None:
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            return None  # Return None instead of raising error
        try:
            _feedback_client = OpenAI(api_key=api_key)
        except Exception as e:
            print(f"Warning: Could not initialize OpenAI client: {e}")
            return None
    return _feedback_client


class FeedbackAnalyzer:
    def __init__(self, interview_agent=None, video_analyzer=None):
        self.interview_agent = interview_agent
        self.video_analyzer = video_analyzer
    
    def analyze_interview(self, session_id: str) -> Dict:
        """Analyze interview using session_id to get conversation history"""
        if not self.interview_agent:
            raise ValueError("InterviewAgent not provided")
        
        if session_id not in self.interview_agent.conversation_history:
            raise ValueError(f"Session {session_id} not found")
        
        conversation_history = self.interview_agent.conversation_history[session_id]
        session = self.interview_agent.sessions[session_id]
        
        # Extract conversation context
        role = session.get("role", "unknown")
        
        # Include code submissions in feedback context
        code_submissions_text = ""
        if hasattr(self.interview_agent, 'code_submissions') and session_id in self.interview_agent.code_submissions:
            code_subs = self.interview_agent.code_submissions[session_id]
            if code_subs:
                code_submissions_text = f"\n\nCode Submissions ({len(code_subs)} total):\n"
                for i, sub in enumerate(code_subs, 1):
                    code_submissions_text += f"\nSubmission {i} ({sub.get('language', 'unknown')}):\n{sub.get('code', '')}\n"
        
        full_conversation = "\n\n".join([
            f"{'Interviewer' if msg['role'] == 'assistant' else 'Candidate'}: {msg['content']}"
            for msg in conversation_history
        ]) + code_submissions_text
        
        # Analyze using LLM (try Groq first, then Gemini)
        feedback_prompt = self._build_feedback_prompt(full_conversation, role)
        
        try:
            # Try Groq first
            from groq import Groq
            groq_api_key = os.getenv("GROQ_API_KEY", "")
            if groq_api_key:
                try:
                    groq_client = Groq(api_key=groq_api_key)
                    response = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": "You are an expert interview coach providing constructive feedback on interview performance."},
                            {"role": "user", "content": feedback_prompt}
                        ],
                        temperature=0.7,
                        max_tokens=800
                    )
                    feedback_text = response.choices[0].message.content.strip()
                    print("[INFO] Feedback generated using Groq")
                except Exception as groq_error:
                    print(f"[WARNING] Groq feedback failed: {groq_error}")
                    # Try Gemini as fallback
                    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
                    if gemini_api_key:
                        import google.generativeai as genai
                        genai.configure(api_key=gemini_api_key)
                        model = genai.GenerativeModel('gemini-pro')
                        
                        prompt = f"You are an expert interview coach providing constructive feedback on interview performance.\n\n{feedback_prompt}"
                        response = model.generate_content(prompt)
                        feedback_text = response.text.strip()
                        print("[INFO] Feedback generated using Gemini")
                    else:
                        raise groq_error
            else:
                raise ValueError("No API key configured for feedback generation")
                
        except Exception as e:
            print(f"[ERROR] Error generating feedback: {e}")
            feedback_text = self._generate_fallback_feedback(conversation_history)
        
        # Parse structured feedback
        structured_feedback = self._parse_feedback(feedback_text, conversation_history)
        
        # Add video analysis if available
        video_analysis_summary = None
        if self.video_analyzer:
            try:
                video_analysis_summary = self.video_analyzer.get_session_analysis_summary(session_id)
                # Enhance feedback with video insights
                if video_analysis_summary.get("total_frames_analyzed", 0) > 0:
                    if video_analysis_summary.get("overall_eye_contact") == "good":
                        structured_feedback["strengths"].append("Maintained good eye contact throughout")
                    elif video_analysis_summary.get("overall_eye_contact") == "poor":
                        structured_feedback["areas_for_improvement"].append("Work on maintaining better eye contact with the camera")
                    
                    if video_analysis_summary.get("average_confidence") == "low":
                        structured_feedback["areas_for_improvement"].append("Appear more confident in your body language and facial expressions")
                    elif video_analysis_summary.get("average_confidence") == "high":
                        structured_feedback["strengths"].append("Displayed confidence through body language")
            except Exception as e:
                print(f"Error getting video analysis: {e}")
        
        # Ensure arrays are populated from fallback if empty
        if not structured_feedback.get("strengths"):
            structured_feedback["strengths"] = ["Engaged in conversation", "Provided responses to questions"]
        if not structured_feedback.get("areas_for_improvement"):
            structured_feedback["areas_for_improvement"] = ["Consider providing more specific examples", "Practice structuring responses"]
        if not structured_feedback.get("recommendations"):
            structured_feedback["recommendations"] = ["Practice common interview questions", "Prepare specific examples"]
        
        return {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "overall_score": structured_feedback["overall_score"],
            "strengths": structured_feedback["strengths"],
            "areas_for_improvement": structured_feedback["areas_for_improvement"],
            "detailed_feedback": feedback_text,
            "detailed_analysis": structured_feedback.get("detailed_analysis", ""),
            "recommendations": structured_feedback["recommendations"],
            "communication_score": structured_feedback.get("communication_score", 5),
            "technical_score": structured_feedback.get("technical_score", 5),
            "preparation_score": structured_feedback.get("preparation_score", 5),
            "video_analysis": video_analysis_summary
        }
    
    def _build_feedback_prompt(self, conversation: str, role: str) -> str:
        """Build prompt for feedback analysis"""
        return f"""You are an expert interview coach analyzing a REAL mock interview for a {role} position. Provide DETAILED, SPECIFIC, and HONEST feedback based on the candidate's ACTUAL performance.

Interview Conversation:
{conversation}

CRITICAL INSTRUCTIONS:
1. READ the entire conversation carefully
2. QUOTE specific things the candidate said
3. Give HONEST scores (not default 7/10) - use the full range 1-10
4. Be SPECIFIC about what they did well and what needs improvement
5. Reference ACTUAL examples from their responses
6. Evaluate depth, clarity, and relevance of their answers
7. Consider: Did they give examples? Were answers detailed? Did they show expertise?

Scoring Guidelines:
- 9-10: Exceptional - detailed answers, strong examples, excellent communication
- 7-8: Good - solid answers with some examples, clear communication
- 5-6: Average - basic answers, lacking detail or examples
- 3-4: Below average - vague answers, poor communication
- 1-2: Poor - minimal effort, unclear responses

Please provide detailed feedback in this EXACT format:

OVERALL SCORE: [Honest score 1-10 based on actual performance]

STRENGTHS:
- [Specific strength with QUOTE or example from conversation]
- [Another strength with actual reference]
- [Third strength with specific example]
- [Fourth strength if applicable]

AREAS FOR IMPROVEMENT:
- [Specific weakness with example of what they said/didn't say]
- [Another area with reference to their actual response]
- [Third area with specific example]
- [Fourth area if applicable]

COMMUNICATION SCORE: [1-10 - clarity, articulation, structure]
TECHNICAL SCORE: [1-10 - knowledge, problem-solving, expertise]
PREPARATION SCORE: [1-10 - examples, depth, readiness]

DETAILED ANALYSIS:
[2-3 paragraphs analyzing their overall performance, referencing specific moments from the interview]

RECOMMENDATIONS:
- [Specific, actionable recommendation based on their performance]
- [Another recommendation with concrete steps]
- [Third recommendation]
- [Fourth recommendation if needed]

REMEMBER: Be HONEST and SPECIFIC. Use the full scoring range. Reference actual quotes and examples!"""
    
    def _parse_feedback(self, feedback_text: str, history: List[Dict]) -> Dict:
        """Parse feedback text into structured format"""
        structured = {
            "overall_score": 5,  # Changed default from 7 to 5 (true average)
            "strengths": [],
            "areas_for_improvement": [],
            "recommendations": [],
            "communication_score": 5,
            "technical_score": 5,
            "preparation_score": 5,
            "detailed_analysis": ""
        }
        
        lines = feedback_text.split("\n")
        current_section = None
        detailed_analysis_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Parse scores - extract just the number
            if "OVERALL SCORE:" in line.upper():
                try:
                    score_str = line.split(":")[-1].strip()
                    # Extract first number found
                    import re
                    numbers = re.findall(r'\d+', score_str)
                    if numbers:
                        score = int(numbers[0])
                        structured["overall_score"] = max(1, min(10, score))  # Clamp between 1-10
                except:
                    pass
            
            elif "COMMUNICATION SCORE:" in line.upper():
                try:
                    score_str = line.split(":")[-1].strip()
                    import re
                    numbers = re.findall(r'\d+', score_str)
                    if numbers:
                        score = int(numbers[0])
                        structured["communication_score"] = max(1, min(10, score))
                except:
                    pass
            
            elif "TECHNICAL SCORE:" in line.upper():
                try:
                    score_str = line.split(":")[-1].strip()
                    import re
                    numbers = re.findall(r'\d+', score_str)
                    if numbers:
                        score = int(numbers[0])
                        structured["technical_score"] = max(1, min(10, score))
                except:
                    pass
            
            elif "PREPARATION SCORE:" in line.upper():
                try:
                    score_str = line.split(":")[-1].strip()
                    import re
                    numbers = re.findall(r'\d+', score_str)
                    if numbers:
                        score = int(numbers[0])
                        structured["preparation_score"] = max(1, min(10, score))
                except:
                    pass
            
            # Parse sections
            elif "STRENGTHS:" in line.upper():
                current_section = "strengths"
            elif "AREAS FOR IMPROVEMENT:" in line.upper() or "IMPROVEMENT:" in line.upper():
                current_section = "areas_for_improvement"
            elif "DETAILED ANALYSIS:" in line.upper():
                current_section = "detailed_analysis"
            elif "RECOMMENDATIONS:" in line.upper():
                current_section = "recommendations"
            elif line.startswith("-") and current_section in ["strengths", "areas_for_improvement", "recommendations"]:
                item = line[1:].strip()
                if item:
                    structured[current_section].append(item)
            elif current_section == "detailed_analysis" and not line.startswith("RECOMMENDATIONS:"):
                detailed_analysis_lines.append(line)
        
        # Join detailed analysis
        if detailed_analysis_lines:
            structured["detailed_analysis"] = "\n".join(detailed_analysis_lines).strip()
        
        return structured
    
    def _generate_fallback_feedback(self, history: List[Dict]) -> str:
        """Generate basic feedback if LLM call fails"""
        turn_count = len([msg for msg in history if msg["role"] == "user"])
        
        return f"""OVERALL SCORE: 7

STRENGTHS:
- Engaged in conversation ({turn_count} responses)
- Provided answers to interview questions

AREAS FOR IMPROVEMENT:
- Consider providing more specific examples in your answers
- Practice structuring responses using STAR method (Situation, Task, Action, Result)
- Work on elaborating on key points

COMMUNICATION SCORE: 7
TECHNICAL SCORE: 7
PREPARATION SCORE: 7

RECOMMENDATIONS:
- Practice common interview questions for your target role
- Prepare specific examples from your experience
- Focus on clear, concise communication"""

