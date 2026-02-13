@echo off
echo ========================================
echo   Backend Server wird gestartet...
echo ========================================
echo.

cd /d "%~dp0"

if not exist "database.sqlite" (
    echo [INFO] Datenbank existiert noch nicht.
    echo [1/2] Erstelle Datenbank und Test-Benutzer...
    call npm run seed
    if %ERRORLEVEL% neq 0 (
        echo.
        echo FEHLER: Seeding fehlgeschlagen!
        pause
        exit /b 1
    )
    echo.
)

echo ========================================
echo   Server startet...
echo ========================================
echo.
echo Backend ist verfuegbar auf: http://localhost:3000
echo API Endpoints: http://localhost:3000/api
echo.
echo Druecken Sie STRG+C um den Server zu stoppen.
echo ========================================
echo.

call npm run dev

pause
