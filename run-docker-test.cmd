@echo off
echo 🚀 Starting Docker-based API Performance Tests
echo ==================================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo 🔨 Building and starting services...
docker-compose -f docker-compose.simple.yml up -d --build

if errorlevel 1 (
    echo ❌ Failed to start services. Check Docker logs.
    pause
    exit /b 1
)

echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo 🧪 Running API performance tests...
docker-compose -f docker-compose.simple.yml exec -T test-client node benchmarks/comparison.js

echo ✅ Testing completed!
echo 🧹 Cleaning up...
docker-compose -f docker-compose.simple.yml down

echo Press any key to exit...
pause >nul