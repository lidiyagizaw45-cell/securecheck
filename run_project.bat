@echo off
setlocal EnableDelayedExpansion
title SecureCheck - Launcher
color 0A

:: Ensure working directory is always script root
cd /d "%~dp0"

echo =====================================================================
echo          [SECURECHECK] FULL-STACK APPLICATION LAUNCHER
echo =====================================================================
echo.

:: 1. Auto-discover Node.js in standard paths if not in PATH
where node >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;!PATH!"
    if exist "C:\Program Files (x86)\nodejs\node.exe" set "PATH=C:\Program Files (x86)\nodejs;!PATH!"
    if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%LOCALAPPDATA%\Programs\node;!PATH!"
)

:: 2. Auto-discover Python in standard paths if not in PATH
where python >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Python313\python.exe" set "PATH=C:\Python313;C:\Python313\Scripts;!PATH!"
    if exist "C:\Python312\python.exe" set "PATH=C:\Python312;C:\Python312\Scripts;!PATH!"
    if exist "C:\Python311\python.exe" set "PATH=C:\Python311;C:\Python311\Scripts;!PATH!"
    if exist "C:\Python310\python.exe" set "PATH=C:\Python310;C:\Python310\Scripts;!PATH!"
    if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python313;!PATH!"
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;!PATH!"
    if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python311;!PATH!"
)

:: 3. Auto-check if node_modules exists; if missing, install immediately!
if not exist "frontend\node_modules\" (
    echo [INFO] frontend\node_modules is missing or was deleted.
    echo [INFO] Automatically installing all dependencies first...
    echo.
    call "%~dp0install_requirements.bat"
)

:: 4. Ensure backend\.env exists
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy /y "backend\.env.example" "backend\.env" >nul
    )
)

echo.
echo 1. Launching FastAPI Backend on http://localhost:8000 ...
start "SecureCheck Backend API (Port 8000)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --reload --port 8000"

echo 2. Launching Vite React Frontend on http://localhost:5173 ...
start "SecureCheck Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo 3. Opening your default web browser...
start http://localhost:5173

echo.
echo =====================================================================
echo  [RUNNING] SecureCheck is now running!
echo  - Frontend Web UI:  http://localhost:5173
echo  - Backend REST API: http://localhost:8000
echo  - Swagger API Docs: http://localhost:8000/docs
echo =====================================================================
echo.
echo (Keep the two opened terminal windows running while using the app.)
echo Press any key to close this launcher window...
pause >nul

