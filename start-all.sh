#!/bin/bash

echo "========================================"
echo "Starting Financial Risk Scoring System"
echo "========================================"
echo ""

echo "[1/3] Starting ESG Service (Python)..."
cd backend/esg-service
uvicorn esg_service.main:app --reload --port 8000 &
ESG_PID=$!
cd ../..
sleep 3

echo "[2/3] Starting Backend API (Java)..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..
sleep 5

echo "[3/3] Starting Frontend (Next.js)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "All services are starting..."
echo "========================================"
echo ""
echo "ESG Service:    http://localhost:8000"
echo "Backend API:   http://localhost:8080"
echo "Frontend:      http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "kill $ESG_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait



