@echo off
echo ========================================
echo Starting Financial Risk Scoring System
echo ========================================
echo.

echo [1/3] Starting ESG Service (Python)...
start "ESG Service" cmd /k "cd backend\esg-service && python -m uvicorn esg_service.main:app --reload --port 8000"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API (Java)...
start "Backend API" cmd /k "cd backend && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend (Next.js)...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo ESG Service:    http://localhost:8000
echo Backend API:   http://localhost:8080
echo Frontend:      http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul



