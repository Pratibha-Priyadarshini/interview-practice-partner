# 🎥 Gemini Video Analysis Setup Guide

## ✅ Your Gemini API Key is Already Configured!

Your `.env` file already contains:
```
GEMINI_API_KEY=AIzaSyDlQUlV3ap1IITbLo9C1tAhXdCiwo11_sM
```

## 📋 Required Package

Make sure you have the Google Generative AI package installed:

```bash
pip install google-generativeai pillow
```

## 🚀 How Video Analysis Works

### 1. **During Interview:**
- Camera captures frames every 5 seconds
- Frames are sent to backend
- Gemini Vision API analyzes:
  - Eye contact (good/moderate/poor)
  - Facial expressions (positive/neutral/negative/anxious)
  - Body language (confident/neutral/nervous/engaged)
  - Confidence level (high/moderate/low)
  - Malpractice detection (none/suspicious/detected)

### 2. **In Feedback Report:**
- Total frames analyzed
- Overall eye contact percentage
- Average confidence score
- Malpractice incidents (if any)
- Key observations

## 🔧 Troubleshooting

### If video analysis shows "Not Available":

1. **Check API Key:**
   ```bash
   # In backend/.env
   GEMINI_API_KEY=your_actual_key_here
   ```

2. **Install Required Packages:**
   ```bash
   cd backend
   pip install google-generativeai pillow
   ```

3. **Restart Backend:**
   ```bash
   # Stop the backend (Ctrl+C)
   # Start again
   python main.py
   ```

4. **Check Camera Permissions:**
   - Browser must have camera access
   - Click "Enable Camera" button in interview
   - Allow camera permissions when prompted

5. **Verify API Key is Valid:**
   - Go to: https://makersuite.google.com/app/apikey
   - Check if your key is active
   - Generate new key if needed

## 📊 Expected Output

### With Camera ON and API Key:
```
Video Analysis Report
👁️ Eye Contact: 85% ✅ Excellent
💪 Confidence: 8.5/10 ✅ Strong
🎥 Frames Analyzed: 12 ✅ Captured
🛡️ Malpractice: 0 ✅ Clean
```

### With Camera ON but NO API Key:
```
Video Analysis Report
👁️ Eye Contact: N/A ⚪ Not Analyzed
💪 Confidence: N/A ⚪ Not Analyzed
🎥 Frames Analyzed: 12 ✅ Captured
🛡️ Malpractice: 0 ✅ Clean

Note: 12 frames captured but not analyzed
Video analysis requires GEMINI_API_KEY to be configured
```

## 🎨 Theme Colors

The interview session now uses:
- **Light Mode**: Dark pink gradients (#be185d → #9f1239)
- **Dark Mode**: Blue gradients (#3b82f6 → #8b5cf6)

All colors automatically adapt based on the selected theme!

## 🔐 API Key Security

**Important:** Never commit your `.env` file to version control!

The `.gitignore` file should include:
```
backend/.env
```

## 📝 Notes

- Gemini API has a free tier with generous limits
- Video analysis is optional - interviews work without it
- Frames are analyzed in real-time during the interview
- Analysis results are stored with the interview feedback
- No video is stored - only analysis results

## 🆘 Support

If you encounter issues:
1. Check backend console for error messages
2. Verify API key is correct
3. Ensure packages are installed
4. Check camera permissions in browser
5. Try restarting the backend server

---

**Status:** ✅ Gemini API Key Configured and Ready!
