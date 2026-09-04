@echo off
setlocal EnableDelayedExpansion
title SecureCheck - Automated Setup and Dependency Installer
color 0B

:: Ensure working directory is always the script root folder
cd /d "%~dp0"

echo =====================================================================
echo          [SECURECHECK] 1-CLICK UNIVERSAL DEPENDENCY INSTALLER
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

:: 3. Run Universal Python Installer if Python is available
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Python detected. Running automated dependency setup engine...
    python setup_node_modules.py
    if !errorlevel! equ 0 (
        echo.
        echo =====================================================================
        echo  [SUCCESS] ALL DEPENDENCIES AND NODE_MODULES INSTALLED SUCCESSFULLY!
        echo =====================================================================
        echo.
        echo You are ready to start SecureCheck!
        echo   - Double click "run_project.bat" (or "start.bat")
        echo.
        pause
        exit /b 0
    ) else (
        echo [WARNING] Python installer encountered a warning. Trying direct shell fallback...
    )
)

:: Fallback Direct Batch Installation Pipeline
echo.
echo [ 15%%] Checking Python runtime...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your PATH!
    echo Please download and install Python 3.10+ from: https://www.python.org/downloads/
    echo (Make sure to check "Add Python to PATH" during installation)
    echo.
    pause
    exit /b 1
)
python --version

echo.
echo [ 30%%] Checking Node.js and NPM...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / NPM is not installed or not added to your PATH!
    echo Please download and install Node.js (LTS recommended) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js:
node -v
echo [OK] NPM:
call npm -v

echo.
echo [ 50%%] Installing Python Backend dependencies and initializing configuration...
python -m pip install --upgrade pip --quiet
python -m pip install -r backend\requirements.txt --quiet

if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy /y "backend\.env.example" "backend\.env" >nul
        echo [OK] Created backend\.env template.
    )
)

if not exist "backend\data" mkdir "backend\data"

echo.
echo [ 75%%] Downloading and setting up frontend node_modules packages...
cd /d "%~dp0frontend"
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [WARNING] Retrying npm install with --force...
    call npm install --force
)
cd /d "%~dp0"

echo.
echo =====================================================================
echo  [SUCCESS] 100%% - ALL DEPENDENCIES AND NODE_MODULES ARE READY!
echo =====================================================================
echo.
echo To start SecureCheck:
echo   - Double click "run_project.bat"
echo.
pause

