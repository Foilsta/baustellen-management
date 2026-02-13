@echo off
echo ========================================
echo   Frontend Setup wird gestartet...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Installiere Dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo FEHLER: Installation fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Installation erfolgreich!
echo ========================================
echo.
echo HINWEIS: Stellen Sie sicher, dass das Backend laeuft.
echo Backend muss auf http://localhost:3000 laufen.
echo.
echo Das Frontend startet jetzt...
echo Frontend wird verfuegbar sein auf: http://localhost:5173
echo.
echo Druecken Sie STRG+C um den Server zu stoppen.
echo ========================================
echo.

call npm run dev

pause
