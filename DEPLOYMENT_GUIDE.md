# 🌐 Online-Zugriff & Deployment Guide

## 🏠 1. Zugriff im lokalen Netzwerk (WLAN)

Ihre App ist jetzt so konfiguriert, dass sie im lokalen Netzwerk verfügbar ist.

### Schritte:
1. **Starten Sie die App** auf Ihrem Haupt-PC:
    ```cmd
    # Backend starten
    cd backend
    npm run dev

    # Frontend starten
    cd frontend
    npm run dev
    ```

2. **IP-Adresse finden**:
    - Öffnen Sie ein CMD-Fenster und geben Sie `ipconfig` ein.
    - Suchen Sie nach "IPv4-Adresse" (meist 192.168.x.x).

3. **Auf Handy/Tablet öffnen**:
    - Geben Sie im Browser ein: `http://[IHRE-IP-ADRESSE]:5173`
    - Beispiel: `http://192.168.178.10:5173`

> ⚠️ **Wichtig:** Beide Geräte müssen im selben WLAN sein.

---

## 💾 2. Datenspeicherung

Die Daten werden automatisch in einer lokalen Datenbank-Datei (`backend/database.sqlite`) gespeichert.

- **Persistenz:** Die Daten bleiben erhalten, auch wenn Sie den Browser schließen oder den PC neustarten.
- **Backup:** Kopieren Sie einfach die Datei `database.sqlite` an einen sicheren Ort, um ein Backup zu erstellen.

---

## ☁️ 3. "Richtig" Online stellen (Internet)

Um die App von **überall** (nicht nur Zuhause) zu erreichen, benötigen Sie einen Hosting-Anbieter. Hier ist eine Empfehlung für kostenlose/günstige Anbieter:

### Backend Hosting & Datenbank (Render.com + PostgreSQL)

Um "richtig" online zu gehen, brauchen wir eine Cloud-Datenbank.

#### Schritt 1: PostgreSQL Datenbank erstellen (Kostenlos)
1. Gehen Sie auf [Render.com](https://render.com) und erstellen Sie einen Account.
2. Klicken Sie auf **"New + "** -> **"PostgreSQL"**.
3. Name: `baustellen-db` (oder beliebig).
4. Region: `Frankfurt` (eu-central-1) für beste Performance.
5. Plan: `Free`.
6. Klicken Sie auf **"Create Database"**.
7. Kopieren Sie nach der Erstellung die **"Internal Database URL"** (für Render Hosting) oder **"External Database URL"** (für Zugriff vom PC).

#### Schritt 2: Backend deployen
1. Erstellen Sie ein neues Github-Repository und pushen Sie Ihren Code.
2. In Render: **"New + "** -> **"Web Service"**.
3. Verbinden Sie Ihr Repository.
4. Settings:
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. **WICHTIG:** Gehen Sie zu "Environment Variables" und fügen Sie hinzu:
   - `DATABASE_URL`: [Die URL aus Schritt 1]
   - `JWT_SECRET`: [Ein sicheres, langes Passwort]
   - `NODE_ENV`: `production`

Das Backend verbindet sich nun automatisch mit der PostgreSQL-Datenbank statt der lokalen Datei!

### Frontend Hosting (Vercel.com)
1. Gehen Sie auf [Vercel.com](https://vercel.com).
2. Importieren Sie Ihr GitHub-Repository.
3. Framework Preset: `Vite`
4. Environment Variables:
   - `VITE_API_URL`: [Die URL Ihres Render-Backends, z.B. https://baustellen-backend.onrender.com]
5. Klicken Sie auf "Deploy".

---

## 🔄 Migration & Daten
Ihre App ist jetzt **Dual-Stack fähig**:
- **Lokal**: Nutzt weiterhin automatisch `database.sqlite` (einfach für Entwicklung).
- **Online**: Nutzt automatisch PostgreSQL, sobald `DATABASE_URL` gesetzt ist.

Sie können also einfach weiter programmieren und Änderungen pushen – es funktioniert beides!
