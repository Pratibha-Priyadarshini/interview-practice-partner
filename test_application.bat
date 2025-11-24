@echo off
echo ========================================
echo Interview Practice Partner - Test Script
echo ========================================
echo.

echo [1/5] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)
echo ✓ Python found
echo.

echo [2/5] Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

echo [3/5] Checking backend dependencies...
if not exist "backend\venv" (
    echo ERROR: Backend virtual environment not found!
    echo Run: setup_backend.bat
    pause
    exit /b 1
)
echo ✓ Backend venv exists
echo.

echo [4/5] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies not installed!
    echo Run: setup_frontend.bat
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

echo [5/5] Checking environment variables...
if not exist "backend\.env" (
    echo ERROR: Backend .env file not found!
    echo Copy .env.example to .env and add your OPENAI_API_KEY
    pause
    exit /b 1
)
echo ✓ .env file exists
echo.

echo ========================================
echo All checks passed! ✓
echo ========================================
echo.
echo To run the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn main:app --reload --port 8000
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
