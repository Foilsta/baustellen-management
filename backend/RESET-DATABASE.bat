@echo off
echo ========================================
echo   Datenbank wird neu initialisiert...
echo ========================================
echo.

cd /d "%~dp0"

echo [WARNUNG] Dies loescht alle bestehenden Daten!
echo.
pause

echo.
echo Erstelle neue Datenbank mit allen Benutzern...
call npm run seed

echo.
echo ========================================
echo   Fertig!
echo ========================================
echo.
echo Sie koennen sich nun mit folgenden Benutzern anmelden:
echo.
echo   Admin:  admin / admin123
echo   Lina:   Lina / lina123
echo   Max:    Max / max123
echo   Sarah:  Sarah / sarah123
echo   Tom:    Tom / tom123
echo.
pause
