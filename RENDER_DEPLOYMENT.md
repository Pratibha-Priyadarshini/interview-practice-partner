# 🚀 Render Deployment - Step by Step

## 📋 Quick Deployment Steps

### **Step 1: Sign Up on Render**

1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up with your **GitHub account**
4. Authorize Render to access your repositories

---

### **Step 2: Deploy Backend**

1. **Click "New +"** (top right) → **"Web Service"**

2. **Connect Repository**:
   - Find: `interview-practice-partner`
   - Click **"Connect"**

3. **Configure Backend**:
   - **Name**: `interview-backend-latest` (or any unique name)
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Python 3`
   - **Python Version**: `3.11.0` (set in Environment Variables)
   - **Build Command**: 
     ```
     cd backend && pip install --no-cache-dir -r requirements.txt
     ```
   - **Start Command**: 
     ```
     cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: **Free**

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   
   Add these 3 variables (get values from your local backend/.env file):
   
   **Variable 1:**
   - Key: `GROQ_API_KEY`
   - Value: `[Your GROQ API Key from backend/.env]`
   
   **Variable 2:**
   - Key: `GEMINI_API_KEY`
   - Value: `[Your GEMINI API Key from backend/.env]`
   
   **Variable 3:**
   - Key: `SECRET_KEY`
   - Value: `[Your SECRET_KEY from backend/.env]`

5. **Click "Create Web Service"**

6. **Wait 5-10 minutes** for deployment

7. **Copy the URL** (e.g., `https://interview-backend-latest.onrender.com`)

---

### **Step 3: Deploy Frontend**

1. **Click "New +"** → **"Static Site"**

2. **Connect Repository**:
   - Select: `interview-practice-partner`
   - Click **"Connect"**

3. **Configure Frontend**:
   - **Name**: `interview-practice-partner` (or any unique name)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: 
     ```
     cd frontend && npm install && npm run build
     ```
   - **Publish Directory**: `frontend/dist`

4. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://interview-backend-latest.onrender.com` (your backend URL from Step 2)

5. **Click "Create Static Site"**

6. **Wait 5-10 minutes** for deployment

7. **Copy the URL** (e.g., `https://interview-practice-partner.onrender.com`)

---

### **Step 4: Test Deployment**

1. **Open your frontend URL** in browser
2. **Register a new account**
3. **Start an interview**
4. **Test voice interaction**
5. **Enable camera** (test video analysis)
6. **Complete interview** and check feedback

---

## ⚠️ Important Notes

### **Free Tier Limitations:**
- Services sleep after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- 750 hours/month free (plenty for demo and testing)

### **Database:**
- SQLite will be created automatically
- Data persists on the server
- For production, consider upgrading to PostgreSQL

### **Cold Starts:**
- First request after sleep takes 30-60 seconds
- Keep this in mind during demo
- You can "wake up" the service before demo by visiting the URL

---

## 🔧 Troubleshooting

### **Backend Deploy Failed:**
1. Check build logs in Render dashboard
2. Verify requirements.txt is correct
3. Check environment variables are set
4. Try redeploying

### **Frontend Can't Connect to Backend:**
1. Check VITE_API_URL is correct
2. Verify CORS is configured in backend
3. Check browser console for errors
4. Ensure backend is running (not sleeping)

### **Database Errors:**
1. Database is created automatically on first run
2. Check backend logs for errors
3. Verify SQLAlchemy is installed

---

## 📝 After Deployment

### **Update README.md:**

Add deployment section:
```markdown
## 🌐 Live Demo

- **Frontend**: https://interview-practice-partner.onrender.com
- **Backend API**: https://interview-backend-latest.onrender.com

Note: Free tier services may take 30-60 seconds to wake up on first request.
```

### **Push Changes:**
```bash
git add .
git commit -m "Add deployment configuration for Render"
git push
```

Render will automatically redeploy!

---

## ✅ Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables configured
- [ ] CORS updated
- [ ] Tested registration
- [ ] Tested interview flow
- [ ] Tested video analysis
- [ ] URLs added to README
- [ ] Changes pushed to GitHub

---

## 🎯 Quick Summary

**Backend URL**: `https://interview-backend-latest.onrender.com`  
**Frontend URL**: `https://interview-practice-partner.onrender.com`

**Deployment Time**: ~15-20 minutes total

---

**Ready to deploy? Follow the steps above! 🚀**

*Remember: Free tier services sleep after 15 min, so wake them up before your demo!*
