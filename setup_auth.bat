@echo off
echo ========================================
echo Setting up Authentication System
echo ========================================
echo.

echo [1/3] Installing frontend dependencies...
cd frontend
call npm install react-router-dom
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend dependencies installed
echo.

echo [2/3] Checking backend dependencies...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Backend dependencies ready
echo.

echo [3/3] Initializing database...
echo Database will be created automatically on first run
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update backend/.env with your API keys and SECRET_KEY
echo 2. Run: setup_backend.bat (in one terminal)
echo 3. Run: setup_frontend.bat (in another terminal)
echo 4. Open http://localhost:5173 and register a new account
echo.
pause
