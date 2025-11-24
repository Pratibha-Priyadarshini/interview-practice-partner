# Troubleshooting Guide

## Common Issues and Solutions

### Issue: 500 Internal Server Error on `/api/roles`

**Solution:** 
1. Make sure the backend server is running:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or: source venv/bin/activate  # Linux/Mac
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. Check that the backend is accessible at `http://localhost:8000`
   - Open browser and visit: `http://localhost:8000`
   - You should see: `{"message": "Interview Practice Partner API", "status": "running"}`

3. Check the backend logs for errors

### Issue: Cannot connect to backend from frontend

**Solution:**
1. Ensure backend is running on port 8000
2. Ensure frontend is running on port 3000
3. Check CORS settings in `backend/main.py` allow your frontend URL
4. Verify Vite proxy configuration in `frontend/vite.config.js`

### Issue: OpenAI API Key Error

**Solution:**
1. Create `.env` file in `backend/` directory:
   ```bash
   cd backend
   copy .env.example .env  # Windows
   # or: cp .env.example .env  # Linux/Mac
   ```

2. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Make sure you have credits in your OpenAI account

### Issue: Module Import Errors

**Solution:**
1. Ensure all dependencies are installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Verify Python version (3.9+):
   ```bash
   python --version
   ```

3. Try reinstalling dependencies:
   ```bash
   pip install --upgrade -r requirements.txt
   ```

### Issue: Frontend Dependencies Not Installing

**Solution:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json  # Linux/Mac
   # or: rmdir /s node_modules & del package-lock.json  # Windows
   ```

3. Reinstall:
   ```bash
   npm install
   ```

### Issue: Voice Recognition Not Working

**Solution:**
1. Use Chrome or Edge browser (Web Speech API support)
2. Grant microphone permissions in browser settings
3. Check that HTTPS is not required (localhost should work)
4. Fallback to chat mode if voice doesn't work

### Issue: Port Already in Use

**Solution:**
1. Find process using port 8000 (backend):
   ```bash
   netstat -ano | findstr :8000  # Windows
   # or: lsof -i :8000  # Linux/Mac
   ```

2. Kill the process or use a different port:
   ```bash
   uvicorn main:app --reload --port 8001
   ```

3. Update frontend proxy in `frontend/vite.config.js` to match

### Issue: CORS Errors

**Solution:**
1. Check `backend/main.py` CORS origins include your frontend URL
2. Ensure backend is running before frontend
3. Check browser console for specific CORS error messages

### Issue: Backend Starts but API Calls Fail

**Solution:**
1. Check backend logs for error messages
2. Verify OpenAI API key is set correctly
3. Check network connectivity
4. Verify OpenAI account has credits/quota

## Debugging Steps

1. **Check Backend Status:**
   ```bash
   curl http://localhost:8000
   # Should return: {"message": "Interview Practice Partner API", "status": "running"}
   ```

2. **Check API Endpoint:**
   ```bash
   curl http://localhost:8000/api/roles
   # Should return: {"roles": ["sales", "engineer", "retail_associate"]}
   ```

3. **Check Backend Logs:**
   - Look for error messages in the terminal where uvicorn is running
   - Check for import errors, API key errors, or other exceptions

4. **Check Frontend Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

5. **Check Environment Variables:**
   ```bash
   cd backend
   python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', os.getenv('OPENAI_API_KEY', 'NOT SET')[:10] + '...')"
   ```

## Still Having Issues?

1. Verify all prerequisites are installed:
   - Python 3.9+
   - Node.js 18+
   - OpenAI API key with credits

2. Check the README.md for complete setup instructions

3. Review the error messages carefully - they often contain clues

4. Make sure you're running both backend and frontend servers simultaneously

