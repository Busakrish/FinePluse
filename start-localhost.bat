@echo off
echo ====================================================
echo Starting FinPulse AI on Localhost
echo ====================================================

echo Starting Backend Server on http://localhost:5000...
start "FinPulse Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dev Server on http://localhost:3000...
start "FinPulse Frontend" cmd /k "cd frontend && npm run dev"

echo ====================================================
echo Both servers are starting up!
echo Frontend will be accessible at: http://localhost:3000
echo Backend API will be accessible at: http://localhost:5000/api/health
echo ====================================================
pause
