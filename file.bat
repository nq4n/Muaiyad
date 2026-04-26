@echo off
setlocal

set "PROJECT=%~dp0"
if "%PROJECT:~-1%"=="\" set "PROJECT=%PROJECT:~0,-1%"
set "VENV=%PROJECT%\flask"
set "VSCODE=C:\Users\Muaiyad\AppData\Local\Programs\Microsoft VS Code\Code.exe"
set "HOST_URL=http://127.0.0.1:5000/"
set "LOG=%PROJECT%\file-bat.log"

echo [%date% %time%] Starting file.bat from "%PROJECT%" > "%LOG%"

explorer "%PROJECT%"

if exist "%VSCODE%" (
    start "VS Code" "%VSCODE%" "%PROJECT%"
) else (
    start "VS Code" code "%PROJECT%"
)

if not exist "%VENV%\Scripts\activate.bat" (
    echo Virtual environment not found: "%VENV%"
    echo [%date% %time%] Virtual environment not found: "%VENV%" >> "%LOG%"
    pause
    exit /b 1
)

echo [%date% %time%] Launching Flask server and browser >> "%LOG%"
start "Flask Server" "%ComSpec%" /k "cd /d ^"%PROJECT%^" && call ^"%VENV%\Scripts\activate.bat^" && python app.py"
timeout /t 2 /nobreak >nul
start "" "%HOST_URL%"
echo [%date% %time%] Done >> "%LOG%"
