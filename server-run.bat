@echo off
setlocal

set "PROJECT=%~dp0"
if "%PROJECT:~-1%"=="\" set "PROJECT=%PROJECT:~0,-1%"
set "VENV=%PROJECT%\flask"

cd /d "%PROJECT%"
echo Starting Flask server from "%PROJECT%"
echo.

if not exist "%VENV%\Scripts\python.exe" (
    echo Python not found: "%VENV%\Scripts\python.exe"
    echo.
    pause
    exit /b 1
)

"%VENV%\Scripts\python.exe" "%PROJECT%\app.py"

echo.
echo Flask server stopped or failed.
pause
