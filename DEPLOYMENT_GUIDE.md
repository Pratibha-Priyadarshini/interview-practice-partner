# 🚀 Deployment Guide - Interview Practice Partner

## Quick Deployment Options

### **Option 1: Render (Recommended - Free & Easy)**

#### Step 1: Prepare Backend for Deployment

1. **Update CORS in backend/main.py**:

Add your frontend URL to allowed origins (we'll do this after getting the URL).

#### Step 2: Deploy on Render

1. **Go to**: https://render.com
2. **Sign up** with your GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository**: `interview-practice-partner`

**Backend Setup**:
- **Name**: `interview-backend`
- **Environment**: `Python 3`
- **Build Command**: 
  ```bash
  cd backend && pip install -r requirements.txt
  ```
- **Start Command**: 
  ```bash
  cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- **Plan**: Free
- **Environment Variables** (click "Advanced"):
  - `GROQ_API_KEY`: (your key from .env)
  - `GEMINI_API_KEY`: (your key from .env)
  - `SECRET_KEY`: (your key from .env)

5. **Click "Create Web Service"**
6. **Wait 5-10 minutes** for deployment
7. **Copy the URL** (e.g., `https://interview-backend.onrender.com`)

**Frontend Setup**:
1. **Click "New +"** → **"Static Site"**
2. **Connect same repository**
3. **Name**: `interview-frontend`
4. **Build Command**: 
   ```bash
   cd frontend && npm install && npm run build
   ```
5. **Publish Directory**: `frontend/dist`
6. **Environment Variables**:
   - `VITE_API_URL`: (your backend URL from above)
7. **Click "Create Static Site"**
8. **Wait 5-10 minutes**
9. **Copy the URL** (e.g., `https://interview-frontend.onrender.com`)

#### Step 3: Update CORS

Update `backend/main.py` to allow your frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://interview-frontend.onrender.com"  # Add your frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Push changes:
```bash
git add backend/main.py
git commit -m "Update CORS for production"
git push
```

Render will auto-redeploy!

---

### **Option 2: Railway (Alternative - Also Free)**

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub**
4. **Select your repository**
5. **Add environment variables**
6. **Deploy!**

---

### **Option 3: Local Demo (For Video Recording)**

If you just need it running for the demo video:

**Terminal 1 - Backend**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`

---

## 🔧 Pre-Deployment Checklist

Before deploying:
- [ ] API keys are ready (GROQ_API_KEY, GEMINI_API_KEY)
- [ ] SECRET_KEY generated
- [ ] Database will be created automatically
- [ ] CORS configured for production URL

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Render Free**: 
  - Services sleep after 15 min of inactivity
  - First request takes 30-60 seconds to wake up
  - 750 hours/month free

### For Demo Video:
- **Option 1**: Deploy and use live URL
- **Option 2**: Run locally (localhost:5173)
- **Option 3**: Record with local, mention "deployed version available"

---

## 🎥 For Demo Video

You can either:
1. **Use deployed URL** (looks more professional)
2. **Use localhost** (works fine, just mention it's deployable)

Both are acceptable for the submission!

---

## 📝 Update Frontend API URL

If deploying, update `frontend/src` files to use environment variable:

Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

Update API calls to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

---

## 🆘 Troubleshooting

### Backend won't start:
- Check environment variables are set
- Check logs in Render dashboard
- Verify requirements.txt is complete

### Frontend can't connect:
- Check CORS settings in backend
- Verify API_URL is correct
- Check browser console for errors

### Database issues:
- SQLite will be created automatically
- For production, consider PostgreSQL (Render provides free tier)

---

## ✅ Quick Start (Local for Demo)

Fastest way to get running for demo video:

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Open: http://localhost:5173

**This is perfectly fine for the demo video!**

---

## 🚀 Deployment Status

- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Tested and working

---

**Choose the option that works best for you! Local demo is totally fine! 🎉**
