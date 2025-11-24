@echo off
echo Setting up Backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo Backend setup complete!
echo.
echo Next steps:
echo 1. Copy .env.example to .env: copy .env.example .env
echo 2. Edit .env and add your OPENAI_API_KEY
echo 3. Run: uvicorn main:app --reload --port 8000
pause

