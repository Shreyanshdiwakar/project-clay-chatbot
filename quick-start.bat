@echo off
echo Starting Project Clay Chatbot Development Server...
echo.
npm run dev

:: Keep window open if there's an error
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo An error occurred while starting the server.
  pause
) 