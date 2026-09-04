@echo off
title SecureCheck - Automated Test Suite
color 0E

cd /d "%~dp0"

echo =====================================================================
echo          [TESTS] RUNNING SECURECHECK BACKEND TEST SUITE
echo =====================================================================
echo.

python -m pytest backend/test_backend.py -v
if %errorlevel% neq 0 (
    echo.
    echo ❌ Tests encountered failures!
) else (
    echo.
    echo ✅ All automated test suites passed successfully!
)

echo.
pause
