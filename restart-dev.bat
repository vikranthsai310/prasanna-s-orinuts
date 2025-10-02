@echo off
echo.
echo ===============================================
echo   Restarting Development Server
echo ===============================================
echo.
echo This will clear cache and restart the server.
echo.
cd /d "d:\Desktop\folder prassanas\prasanna-premium-orchard"
echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting fresh development server...
npm run dev
