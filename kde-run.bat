@echo off
setlocal

set "PROJECT=%~dp0"
if "%PROJECT:~-1%"=="\" set "PROJECT=%PROJECT:~0,-1%"
set "VENV=%PROJECT%\flask"
set "VSCODE=C:\Users\Muaiyad\AppData\Local\Programs\Microsoft VS Code\Code.exe"
set "HOST_URL=http://127.0.0.1:5000/"

cd /d "%PROJECT%"

if exist "%VSCODE%" (
    start "VS Code" "%VSCODE%" "%PROJECT%"
)

if not exist "%PROJECT%\app.py" (
    exit /b 1
)

if not exist "%VENV%\Scripts\python.exe" (
    exit /b 1
)

start "Flask Server" /D "%PROJECT%" "%PROJECT%\server-run.bat"

timeout /t 6 /nobreak >nul
start "" "%HOST_URL%"
