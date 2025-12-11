@echo off
echo Starting Online Canteen Application...

REM Check for Node.js installation paths
set NODEJS_PATHS=^
"C:\Program Files\nodejs" ^
"C:\Program Files (x86)\nodejs" ^
"%APPDATA%\npm" ^
"%ProgramFiles%\nodejs" ^
"%ProgramFiles(x86)%\nodejs"

set FOUND_NODE=0

for %%i in (%NODEJS_PATHS%) do (
    if exist "%%~i\node.exe" (
        echo Found Node.js at: %%i
        set PATH=%%i;%PATH%
        set FOUND_NODE=1
    )
)

if %FOUND_NODE%==0 (
    echo Node.js not found in common locations.
    echo Please make sure Node.js is installed and try again.
    echo You can download Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Start MySQL if needed
echo Checking MySQL service...
sc query MySQL >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo MySQL service not found. Please make sure MySQL is installed and running.
    echo The application requires MySQL to be running.
    pause
    exit /b 1
)

REM Start the backend
echo Starting Spring Boot backend...
start cmd /k "cd /d %~dp0 && mvnw.cmd spring-boot:run"

REM Wait for backend to start
echo Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

REM Start the frontend
echo Starting React frontend...
cd /d %~dp0frontend
call npm install
call npm start

echo Application started successfully!
pause
