@echo off
echo Starting Project Clay Chatbot Development Server...
echo.

:: Kill any running Node processes (optional - comment out if not needed)
echo Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

:: Try to clean the .next directory for a fresh start
echo Removing .next directory if it exists...
if exist .next (
  rmdir /s /q .next >nul 2>&1
  echo .next directory removed.
) else (
  echo No .next directory found.
)

:: Start the development server
echo.
echo Starting development server...
echo.
npm run dev

:: Keep window open if there's an error
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo An error occurred while starting the server.
  pause
) 