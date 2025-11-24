@echo off
echo ========================================
echo GitHub Push Script
echo Interview Practice Partner
echo ========================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Checking what will be committed...
git status
echo.

echo ========================================
echo IMPORTANT: Verify that .env is NOT listed above!
echo ========================================
echo.

pause

echo Step 4: Creating commit...
git commit -m "Initial commit: Interview Practice Partner - AI-powered mock interview platform for Eightfold AI Challenge 2025"
echo.

echo ========================================
echo Next Steps:
echo 1. Create a PUBLIC repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo ========================================
echo.

echo Opening GitHub in browser...
start https://github.com/new

pause
