@echo off
REM Network Performance Testing Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Starting Docker-based Network Performance Tests
echo ==================================================

REM Function to check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)
echo ✅ Docker is running

REM Parse command line arguments
set "COMMAND=%~1"
if "%COMMAND%"=="" set "COMMAND=test"

if "%COMMAND%"=="test" goto :run_test
if "%COMMAND%"=="start" goto :start_services
if "%COMMAND%"=="condition" goto :run_condition
if "%COMMAND%"=="list" goto :list_conditions
if "%COMMAND%"=="logs" goto :show_logs
if "%COMMAND%"=="stop" goto :cleanup
goto :show_help

:run_test
echo 🔨 Building and starting services...
docker-compose up -d --build

echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo 🧪 Running network performance tests...
docker-compose exec -T test-client node benchmarks/network-performance-test.js

echo 📄 Copying results to host...
for /f %%i in ('docker-compose ps -q test-client') do (
    docker cp %%i:/app/results ./results/
)

echo ✅ Network performance testing completed!
echo 📄 Check the results/ directory for detailed reports
goto :end

:start_services
echo 🔨 Building and starting services...
docker-compose up -d --build

echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo ✅ Services started. Use 'docker-compose logs -f' to view logs
goto :end

:run_condition
set "CONDITION=%~2"
if "%CONDITION%"=="" (
    echo ❌ Please specify a network condition
    echo Available conditions: FIBER, WIFI_EXCELLENT, WIFI_GOOD, LTE_4G, WIFI_POOR, MOBILE_3G, MOBILE_2G, SATELLITE, UNRELIABLE
    exit /b 1
)

echo 🌐 Testing with %CONDITION% network conditions...

REM Setup network conditions
docker-compose exec -T test-client node network-config/setup-network-conditions.js apply %CONDITION%

REM Wait for conditions to take effect
timeout /t 5 /nobreak >nul

echo 📊 Running quick performance test...
docker-compose exec -T test-client node benchmarks/comparison.js

REM Reset conditions
docker-compose exec -T test-client node network-config/setup-network-conditions.js reset
goto :end

:list_conditions
echo 📋 Available network conditions:
docker-compose exec -T test-client node network-config/setup-network-conditions.js list
goto :end

:show_logs
set "SERVICE=%~2"
if "%SERVICE%"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %SERVICE%
)
goto :end

:cleanup
echo 🧹 Cleaning up...
docker-compose down -v
echo ✅ Cleanup completed
goto :end

:show_help
echo Usage: %0 [command] [options]
echo.
echo Commands:
echo   test                    Run complete network performance test suite
echo   start                   Start all services
echo   condition ^<CONDITION^>   Test with specific network condition
echo   list                    List available network conditions
echo   logs [service]          View logs (optional: specific service)
echo   stop                    Stop services and cleanup
echo   help                    Show this help message
echo.
echo Examples:
echo   %0 test                 # Run full test suite
echo   %0 condition MOBILE_3G  # Test with 3G conditions
echo   %0 logs rest-api        # View REST API logs

:end
endlocal