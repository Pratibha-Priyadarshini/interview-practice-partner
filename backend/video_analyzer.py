"""
Video Analyzer - Analyzes video frames for facial expressions, body language, and presentation
Supports both OpenAI GPT-4 Vision and Google Gemini Vision
"""
import os
import base64
from typing import Dict, List, Optional
from datetime import datetime

# Lazy initialization of clients
_openai_client = None
_gemini_model = None

def get_openai_client():
    """Get or create OpenAI client instance"""
    global _openai_client
    if _openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            return None
        try:
            from openai import OpenAI
            _openai_client = OpenAI(api_key=api_key)
        except ImportError:
            print("OpenAI package not installed")
            return None
    return _openai_client

def get_gemini_model():
    """Get or create Gemini model instance"""
    global _gemini_model
    if _gemini_model is None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            print("[INFO] No GEMINI_API_KEY found in environment")
            return None
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            # Try models in order of preference (vision-capable models)
            model_names = [
                'models/gemini-2.5-flash',      # Latest stable multimodal
                'models/gemini-2.0-flash',      # Stable 2.0 version
                'models/gemini-flash-latest',   # Latest flash
                'models/gemini-pro-latest',     # Latest pro
            ]
            
            for model_name in model_names:
                try:
                    _gemini_model = genai.GenerativeModel(model_name)
                    print(f"[INFO] Gemini model initialized successfully with {model_name}")
                    return _gemini_model
                except Exception as e:
                    print(f"[INFO] Model {model_name} not available: {e}")
                    continue
            
            print("[ERROR] No Gemini vision models available")
            return None
            
        except ImportError:
            print("[ERROR] Google Generative AI package not installed. Install with: pip install google-generativeai")
            return None
        except Exception as e:
            print(f"[ERROR] Error initializing Gemini: {e}")
            return None
    return _gemini_model


class VideoAnalyzer:
    def __init__(self, interview_agent=None):
        self.interview_agent = interview_agent
        self.frame_analysis_history: Dict[str, List[Dict]] = {}  # session_id -> list of analyses
    
    def analyze_frame(self, session_id: str, image_base64: str, current_question: str = "") -> Dict:
        """Analyze a single video frame for facial expressions and body language"""
        try:
            # Try Gemini first (free), then OpenAI
            gemini_model = get_gemini_model()
            openai_client = get_openai_client()
            
            # If no vision API available, return neutral analysis WITHOUT storing
            if gemini_model is None and openai_client is None:
                print(f"[INFO] Video analysis skipped - No API key configured")
                return {
                    "eye_contact": "unknown",
                    "facial_expression": "neutral",
                    "body_language": "neutral",
                    "confidence_level": "neutral",
                    "malpractice": "none",
                    "notes": "Video analysis disabled (No API key configured. Add GEMINI_API_KEY or OPENAI_API_KEY)"
                }
            
            # Build analysis prompt
            analysis_prompt = self._build_analysis_prompt(current_question)
            
            analysis_text = ""
            
            # Try Gemini first (free tier available)
            if gemini_model:
                try:
                    import PIL.Image
                    import io
                    
                    print(f"[INFO] Analyzing frame with Gemini for session {session_id}")
                    
                    # Decode base64 image
                    image_data = base64.b64decode(image_base64)
                    image = PIL.Image.open(io.BytesIO(image_data))
                    
                    print(f"[INFO] Image decoded successfully: {image.size}")
                    
                    # Call Gemini Vision API
                    response = gemini_model.generate_content([analysis_prompt, image])
                    
                    # Check if response was blocked
                    if hasattr(response, 'prompt_feedback'):
                        print(f"[INFO] Prompt feedback: {response.prompt_feedback}")
                    
                    analysis_text = response.text.strip()
                    print(f"[SUCCESS] Gemini analysis completed: {analysis_text[:100]}...")
                    
                except Exception as gemini_error:
                    print(f"[ERROR] Gemini analysis failed: {gemini_error}")
                    print(f"[ERROR] Error type: {type(gemini_error).__name__}")
                    # Fall back to OpenAI if available
                    if openai_client is None:
                        raise gemini_error
            
            # Use OpenAI if Gemini failed or not available
            if not analysis_text and openai_client:
                response = openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert interview coach analyzing a candidate's video frame during a mock interview. Provide detailed, constructive observations about facial expressions, body language, eye contact, and presentation."
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": analysis_prompt
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{image_base64}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=200,
                    temperature=0.7
                )
                analysis_text = response.choices[0].message.content.strip()
            
            # Parse and structure the analysis
            structured_analysis = self._parse_analysis(analysis_text)
            
            # Store analysis in history
            if session_id not in self.frame_analysis_history:
                self.frame_analysis_history[session_id] = []
            
            analysis_record = {
                "timestamp": datetime.now().isoformat(),
                "analysis": structured_analysis,
                "raw_text": analysis_text,
                "question_context": current_question
            }
            
            self.frame_analysis_history[session_id].append(analysis_record)
            
            print(f"[INFO] Frame analyzed for session {session_id}. Total frames: {len(self.frame_analysis_history[session_id])}")
            
            return structured_analysis
            
        except Exception as e:
            print(f"Error analyzing video frame: {e}")
            return {
                "eye_contact": "unknown",
                "facial_expression": "neutral",
                "body_language": "neutral",
                "confidence_level": "neutral",
                "notes": f"Analysis unavailable: {str(e)}"
            }
    
    def get_session_analysis_summary(self, session_id: str) -> Dict:
        """Get summary analysis for entire interview session"""
        if session_id not in self.frame_analysis_history:
            return {
                "total_frames_analyzed": 0,
                "overall_eye_contact": "not_analyzed",
                "average_confidence": "not_analyzed",
                "malpractice_incidents": [],
                "malpractice_count": 0,
                "key_observations": ["Video analysis was not enabled for this session"],
                "note": "Enable video analysis by configuring GEMINI_API_KEY or OPENAI_API_KEY"
            }
        
        analyses = self.frame_analysis_history[session_id]
        if not analyses:
            return {
                "total_frames_analyzed": 0,
                "overall_eye_contact": "not_analyzed",
                "average_confidence": "not_analyzed",
                "malpractice_incidents": [],
                "malpractice_count": 0,
                "key_observations": ["No video frames were captured during this session"],
                "note": "Ensure camera permissions are granted"
            }
        
        # Check if frames were actually analyzed (not just stored with "unknown")
        analyzed_frames = [a for a in analyses if a.get("analysis", {}).get("eye_contact") != "unknown"]
        
        if not analyzed_frames:
            # Frames were captured but not analyzed (no API key)
            return {
                "total_frames_analyzed": len(analyses),
                "overall_eye_contact": "not_analyzed",
                "average_confidence": "not_analyzed",
                "malpractice_incidents": [],
                "malpractice_count": 0,
                "key_observations": [f"{len(analyses)} frames captured but not analyzed"],
                "note": "Video analysis requires GEMINI_API_KEY or OPENAI_API_KEY to be configured"
            }
        
        # Aggregate observations
        eye_contact_scores = []
        confidence_scores = []
        all_observations = []
        malpractice_incidents = []
        
        for analysis_record in analyses:
            analysis = analysis_record.get("analysis", {})
            
            # Track malpractice incidents
            malpractice = analysis.get("malpractice", "none")
            if malpractice in ["suspicious", "detected"]:
                malpractice_incidents.append({
                    "timestamp": analysis_record.get("timestamp"),
                    "severity": malpractice,
                    "notes": analysis.get("notes", "")
                })
            
            # Map eye contact to score
            eye_contact = analysis.get("eye_contact", "unknown")
            if eye_contact == "good":
                eye_contact_scores.append(3)
            elif eye_contact == "moderate":
                eye_contact_scores.append(2)
            elif eye_contact == "poor":
                eye_contact_scores.append(1)
            else:
                eye_contact_scores.append(2)  # default moderate
            
            # Map confidence to score
            confidence = analysis.get("confidence_level", "neutral")
            if confidence == "high":
                confidence_scores.append(3)
            elif confidence == "moderate":
                confidence_scores.append(2)
            elif confidence == "low":
                confidence_scores.append(1)
            else:
                confidence_scores.append(2)  # default moderate
            
            if analysis.get("notes"):
                all_observations.append(analysis.get("notes"))
        
        # Calculate averages
        avg_eye_contact_score = sum(eye_contact_scores) / len(eye_contact_scores) if eye_contact_scores else 2
        avg_confidence_score = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 2
        
        # Map scores back to labels
        if avg_eye_contact_score >= 2.5:
            overall_eye_contact = "good"
        elif avg_eye_contact_score >= 1.5:
            overall_eye_contact = "moderate"
        else:
            overall_eye_contact = "poor"
        
        if avg_confidence_score >= 2.5:
            average_confidence = "high"
        elif avg_confidence_score >= 1.5:
            average_confidence = "moderate"
        else:
            average_confidence = "low"
        
        return {
            "total_frames_analyzed": len(analyses),
            "overall_eye_contact": overall_eye_contact,
            "average_confidence": average_confidence,
            "malpractice_incidents": malpractice_incidents,
            "malpractice_count": len(malpractice_incidents),
            "key_observations": all_observations[-5:] if len(all_observations) > 5 else all_observations,
            "detailed_analyses": analyses[-3:] if len(analyses) > 3 else analyses
        }
    
    def _build_analysis_prompt(self, current_question: str = "") -> str:
        """Build prompt for video frame analysis"""
        base_prompt = """Analyze this video frame of a candidate during a mock interview. Provide a concise assessment in the following format:

EYE_CONTACT: [good/moderate/poor]
FACIAL_EXPRESSION: [positive/neutral/negative/anxious]
BODY_LANGUAGE: [confident/neutral/nervous/engaged]
CONFIDENCE_LEVEL: [high/moderate/low]
MALPRACTICE: [none/suspicious/detected]
NOTES: [Brief observation about presentation, posture, or expression]

MALPRACTICE DETECTION - Check for:
- Looking away from camera frequently (reading from another screen)
- Multiple people visible in frame
- Phone or device usage
- Reading from notes/paper
- Someone else speaking or helping
- Unusual eye movements (reading text off-screen)

If any suspicious behavior detected, set MALPRACTICE to "suspicious" or "detected" and mention it in NOTES."""
        
        if current_question:
            base_prompt += f"\n\nContext: The candidate is responding to: '{current_question[:100]}...'"
        
        base_prompt += "\n\nBe specific and constructive. Focus on what would help the candidate improve their interview presence."
        
        return base_prompt
    
    def _parse_analysis(self, analysis_text: str) -> Dict:
        """Parse analysis text into structured format"""
        structured = {
            "eye_contact": "unknown",
            "facial_expression": "neutral",
            "body_language": "neutral",
            "confidence_level": "neutral",
            "malpractice": "none",
            "notes": ""
        }
        
        lines = analysis_text.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if line.upper().startswith("EYE_CONTACT:"):
                value = line.split(":", 1)[-1].strip().lower()
                if "good" in value:
                    structured["eye_contact"] = "good"
                elif "moderate" in value:
                    structured["eye_contact"] = "moderate"
                elif "poor" in value:
                    structured["eye_contact"] = "poor"
            
            elif line.upper().startswith("FACIAL_EXPRESSION:"):
                value = line.split(":", 1)[-1].strip().lower()
                if "positive" in value or "smile" in value:
                    structured["facial_expression"] = "positive"
                elif "negative" in value or "frown" in value:
                    structured["facial_expression"] = "negative"
                elif "anxious" in value or "worried" in value:
                    structured["facial_expression"] = "anxious"
                else:
                    structured["facial_expression"] = "neutral"
            
            elif line.upper().startswith("BODY_LANGUAGE:"):
                value = line.split(":", 1)[-1].strip().lower()
                if "confident" in value:
                    structured["body_language"] = "confident"
                elif "nervous" in value or "tense" in value:
                    structured["body_language"] = "nervous"
                elif "engaged" in value or "attentive" in value:
                    structured["body_language"] = "engaged"
                else:
                    structured["body_language"] = "neutral"
            
            elif line.upper().startswith("CONFIDENCE_LEVEL:"):
                value = line.split(":", 1)[-1].strip().lower()
                if "high" in value:
                    structured["confidence_level"] = "high"
                elif "low" in value:
                    structured["confidence_level"] = "low"
                else:
                    structured["confidence_level"] = "moderate"
            
            elif line.upper().startswith("MALPRACTICE:"):
                value = line.split(":", 1)[-1].strip().lower()
                if "detected" in value:
                    structured["malpractice"] = "detected"
                elif "suspicious" in value:
                    structured["malpractice"] = "suspicious"
                else:
                    structured["malpractice"] = "none"
            
            elif line.upper().startswith("NOTES:"):
                structured["notes"] = line.split(":", 1)[-1].strip()
        
        # If no structured data found, use raw text as notes
        if not structured["notes"] and analysis_text:
            structured["notes"] = analysis_text[:200]
        
        return structured

