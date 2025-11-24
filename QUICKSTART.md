# Quick Start Guide

Get up and running with the Interview Practice Partner in 5 minutes!

## Prerequisites Check

- ✅ Python 3.9+ installed (`python --version`)
- ✅ Node.js 18+ installed (`node --version`)
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Quick Setup

### Windows

1. **Setup Backend:**
   ```cmd
   setup_backend.bat
   ```
   Then edit `backend\.env` and add your `OPENAI_API_KEY`

2. **Setup Frontend:**
   ```cmd
   setup_frontend.bat
   ```

3. **Run the Application:**
   - Terminal 1 (Backend):
     ```cmd
     cd backend
     venv\Scripts\activate
     uvicorn main:app --reload --port 8000
     ```
   - Terminal 2 (Frontend):
     ```cmd
     cd frontend
     npm run dev
     ```

4. **Open Browser:**
   Navigate to `http://localhost:3000`

### Linux/Mac

1. **Setup Everything:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Edit Backend Config:**
   ```bash
   nano backend/.env
   # Add your OPENAI_API_KEY
   ```

3. **Run the Application:**
   - Terminal 1 (Backend):
     ```bash
     cd backend
     source venv/bin/activate
     uvicorn main:app --reload --port 8000
     ```
   - Terminal 2 (Frontend):
     ```bash
     cd frontend
     npm run dev
     ```

4. **Open Browser:**
   Navigate to `http://localhost:3000`

## Test the Application

1. **Select a Role:**
   - Choose from Sales, Engineer, or Retail Associate
   - Enter your name

2. **Start Interview:**
   - Click "Start Interview"
   - Answer questions via chat or voice

3. **End Interview:**
   - Click "End Interview" when ready
   - Review your feedback

## Troubleshooting

### Backend Issues

- **Module not found:** Run `pip install -r requirements.txt` again
- **API key error:** Check that `.env` file exists and has `OPENAI_API_KEY=your_key`
- **Port already in use:** Change port in `main.py` or kill process using port 8000

### Frontend Issues

- **Dependencies not installed:** Run `npm install` in frontend directory
- **Cannot connect to backend:** Ensure backend is running on port 8000
- **Voice not working:** Use Chrome/Edge (Web Speech API support)

### Common Issues

- **CORS errors:** Ensure backend CORS allows your frontend URL
- **API rate limits:** Check your OpenAI API quota
- **Voice recognition fails:** Grant microphone permissions in browser

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize interview roles in `backend/interview_agent.py`
- Modify feedback prompts in `backend/feedback_analyzer.py`
- Customize UI in `frontend/src/components/`

## Support

For issues or questions, refer to:
- Backend API docs: `http://localhost:8000/docs`
- OpenAI API docs: https://platform.openai.com/docs

Happy Interview Practice! 🎯

