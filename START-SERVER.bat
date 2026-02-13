@echo off
echo ========================================
echo  Hoffmann App - Server starten
echo ========================================
echo.
echo Backend-Server wird gestartet...
cd backend
start "Hoffmann Backend" cmd /k "npm start"
echo.
echo Warte 3 Sekunden...
timeout /t 3 /nobreak > nul
echo.
echo Frontend-Server wird gestartet...
cd ..\frontend
start "Hoffmann Frontend" cmd /k "npm run dev"
echo.
echo ========================================
echo  Server wurden gestartet!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Druecken Sie eine Taste zum Beenden...
pause > nul
