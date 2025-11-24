#!/bin/bash

echo "Setting up Interview Practice Partner..."
echo ""

# Setup Backend
echo "=== Setting up Backend ==="
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please edit it and add your OPENAI_API_KEY"
fi
cd ..

# Setup Frontend
echo ""
echo "=== Setting up Frontend ==="
cd frontend
npm install
cd ..

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your OPENAI_API_KEY"
echo "2. Start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000"
echo "3. Start frontend: cd frontend && npm run dev"

