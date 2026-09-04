@echo off
setlocal EnableDelayedExpansion
title SecureCheck
color 0A

cd /d "%~dp0"

if not exist "frontend\node_modules\" (
    echo [INFO] Installing required packages...
    call "%~dp0install_requirements.bat"
)

start "SecureCheck Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --reload --port 8000"
start "SecureCheck Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Backend running on http://localhost:8000
echo Frontend running on http://localhost:5173

