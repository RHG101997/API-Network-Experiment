#!/usr/bin/env pwsh
# Network Performance Testing Script for Windows PowerShell

param(
    [string]$Command = "test"
)

Write-Host "🚀 Starting Docker-based API Performance Tests" -ForegroundColor Green
Write-Host "=================================================="

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

switch ($Command) {
    "test" {
        Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
        docker-compose -f docker-compose.simple.yml up -d --build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to start services" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "🧪 Running API performance tests..." -ForegroundColor Yellow
        docker-compose -f docker-compose.simple.yml exec -T test-client node benchmarks/comparison.js
        
        Write-Host "✅ Testing completed!" -ForegroundColor Green
    }
    
    "start" {
        Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
        docker-compose -f docker-compose.simple.yml up -d --build
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host "Use 'docker-compose -f docker-compose.simple.yml logs -f' to view logs" -ForegroundColor Cyan
    }
    
    "stop" {
        Write-Host "🧹 Stopping services..." -ForegroundColor Yellow
        docker-compose -f docker-compose.simple.yml down -v
        Write-Host "✅ Services stopped!" -ForegroundColor Green
    }
    
    "logs" {
        docker-compose -f docker-compose.simple.yml logs -f
    }
    
    "shell" {
        Write-Host "🐚 Opening shell in test client..." -ForegroundColor Yellow
        docker-compose -f docker-compose.simple.yml exec test-client /bin/sh
    }
    
    default {
        Write-Host "Usage: ./run-tests.ps1 [command]" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor White
        Write-Host "  test    Run API performance tests" -ForegroundColor Cyan
        Write-Host "  start   Start all services" -ForegroundColor Cyan
        Write-Host "  stop    Stop services and cleanup" -ForegroundColor Cyan  
        Write-Host "  logs    View service logs" -ForegroundColor Cyan
        Write-Host "  shell   Open shell in test container" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor White
        Write-Host "  ./run-tests.ps1 test" -ForegroundColor Gray
        Write-Host "  ./run-tests.ps1 start" -ForegroundColor Gray
    }
}