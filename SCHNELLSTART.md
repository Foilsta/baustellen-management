# Schnellstart-Anleitung

## ⚡ So starten Sie die Anwendung

### Methode 1: Mit Batch-Dateien (EMPFOHLEN)

1. **Backend starten:**
   - Navigieren Sie zu: `C:\Users\info\.gemini\antigravity\scratch\baustellen-management\backend`
   - Doppelklick auf `START-BACKEND.bat`
   - Warten Sie bis "Server is running" erscheint

2. **Frontend starten:**
   - Navigieren Sie zu: `C:\Users\info\.gemini\antigravity\scratch\baustellen-management\frontend`
   - Doppelklick auf `START-FRONTEND.bat`
   - Warten Sie bis die URL erscheint

3. **Im Browser öffnen:**
   - http://localhost:5173
   - Login: `admin` / `admin123`

### Methode 2: Mit CMD (Command Prompt)

**Backend (Terminal 1):**
```cmd
cd C:\Users\info\.gemini\antigravity\scratch\baustellen-management\backend
npm run dev
```

**Frontend (Terminal 2 - NEUES Fenster):**
```cmd
cd C:\Users\info\.gemini\antigravity\scratch\baustellen-management\frontend
npm install
npm run dev
```

## ⚠️ WICHTIG

- **NICHT** die Kommentarzeilen (mit `#`) in CMD eingeben
- Beide Server müssen gleichzeitig laufen
- Backend läuft auf Port 3000
- Frontend läuft auf Port 5173

## 🔧 npm audit Warnungen beheben (Optional)

Die Sicherheitswarnungen können Sie ignorieren oder beheben:

```cmd
cd backend
npm audit fix

cd ..\frontend
npm audit fix
```

**ODER** für aggressivere Fixes (kann Breaking Changes verursachen):
```cmd
npm audit fix --force
```

## 📱 Test-Accounts

Nach dem ersten Start sind folgende Benutzer verfügbar:

| Username | Passwort  | Rolle |
|----------|-----------|-------|
| admin    | admin123  | Admin |
| helfer1  | helfer123 | Helfer |

## ✅ Erfolg prüfen

**Backend läuft, wenn Sie sehen:**
```
✓ Database connection established
✓ Database synchronized
🚀 Server is running on http://localhost:3000
```

**Frontend läuft, wenn Sie sehen:**
```
➜  Local:   http://localhost:5173/
```

## 🛑 Server stoppen

- Im Terminal: `STRG + C` drücken
- Bei Batch-Dateien: Fenster schließen

## 🐛 Probleme?

**Frontend startet nicht:**
- Prüfen Sie ob Port 5173 frei ist
- Stellen Sie sicher, dass npm install erfolgreich war

**Backend startet nicht:**
- Prüfen Sie ob Port 3000 frei ist
- Löschen Sie `backend/database.sqlite` und starten Sie neu

**Login funktioniert nicht:**
- Prüfen Sie ob Backend läuft (http://localhost:3000/health sollte funktionieren)
- Prüfen Sie Browser-Console (F12) für Fehler
