@echo off
echo ===================================================
echo       Classroom Gacha - One Click Start
echo ===================================================

echo [1/2] Starting Backend Server...
cd backend
start "Classroom Gacha Backend" cmd /k "conda activate base && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
cd ..

echo [2/2] Starting Frontend...
cd frontend
start "Classroom Gacha Frontend" cmd /k "npm run dev"
cd ..

echo ===================================================
echo       All services started!
echo       Backend: http://127.0.0.1:8000
echo       Frontend: http://localhost:5173
echo ===================================================
pause
