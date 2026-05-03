@echo off
setlocal

set "PROJECT=%~dp0"
if "%PROJECT:~-1%"=="\" set "PROJECT=%PROJECT:~0,-1%"
set "PYTHON=%PROJECT%\flask\Scripts\python.exe"

cd /d "%PROJECT%"

if not exist "%PYTHON%" (
    exit /b 1
)

"%PYTHON%" "%PROJECT%\app.py"
