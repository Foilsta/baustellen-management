# Baustellen-Management Web-App

Eine vollständige Full-Stack-Webanwendung zur Verwaltung einer privaten Baustelle mit Aufgaben- und Materialverwaltung.

## 🚀 Features

- **Benutzerverwaltung**: Admin und Helfer Rollen mit JWT-Authentifizierung
- **Aufgabenverwaltung**: Erstellen, zuweisen, Status ändern (Offen, In Bearbeitung, Erledigt)
- **Materialverwaltung**: Materialien mit Status-Tracking (Benötigt, Bestellt, Eingetroffen)
- **Dashboard**: Übersicht über alle wichtigen Informationen
- **Activity Logging**: Protokollierung aller Änderungen
- **Responsive Design**: Funktioniert auf Desktop und Tablet

## 🛠️ Tech-Stack

### Backend
- **Node.js** + **Express.js**
- **SQLite** Datenbank
- **Sequelize** ORM
- **JWT** für Authentifizierung
- **bcrypt** für Passwort-Hashing

### Frontend
- **React** 18
- **Vite** Build-Tool
- **React Router** v6
- **Axios** für API-Aufrufe
- **Vanilla CSS** mit modernem Design

## 📦 Installation

### Voraussetzungen
- Node.js 20 oder höher

### Backend einrichten

```bash
cd backend
npm install

# Datenbank initialisieren und Seed-Daten erstellen
npm run seed

# Server starten
npm run dev
```

Der Backend-Server läuft auf `http://localhost:3000`

### Frontend einrichten

```bash
cd frontend
npm install

# Development-Server starten
npm run dev
```

Das Frontend läuft auf `http://localhost:5173`

## 👤 Initiale Benutzer

Nach dem Seeding stehen folgende Benutzer zur Verfügung:

| Benutzername | Passwort | Rolle |
|--------------|----------|-------|
| admin | admin123 | Administrator |
| helfer1 | helfer123 | Helfer |

## 📚 API-Endpunkte

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Neuen Benutzer registrieren (Admin only)
- `GET /api/auth/me` - Aktuellen Benutzer abrufen

### Users (Admin only)
- `GET /api/users` - Alle Benutzer abrufen
- `POST /api/users` - Benutzer erstellen
- `PUT /api/users/:id` - Benutzer aktualisieren
- `DELETE /api/users/:id` - Benutzer löschen

### Tasks
- `GET /api/tasks` - Alle Aufgaben abrufen
- `GET /api/tasks/:id` - Einzelne Aufgabe mit Activity Log
- `POST /api/tasks` - Aufgabe erstellen
- `PUT /api/tasks/:id` - Aufgabe aktualisieren
- `DELETE /api/tasks/:id` - Aufgabe löschen (Admin only)
- `POST /api/tasks/:id/assign` - Aufgabe zuweisen (Admin only)
- `POST /api/tasks/:id/take` - Aufgabe übernehmen
- `POST /api/tasks/:id/complete` - Aufgabe als erledigt markieren

### Materials
- `GET /api/materials` - Alle Materialien abrufen
- `GET /api/materials/:id` - Einzelnes Material mit Activity Log
- `POST /api/materials` - Material erstellen
- `PUT /api/materials/:id` - Material aktualisieren
- `DELETE /api/materials/:id` - Material löschen (Admin only)

### Activity Logs
- `GET /api/activity` - Activity Logs abrufen

## 🗄️ Datenbankstruktur

### Users
- id, username, email, password, role (admin/helper)

### Tasks
- id, title, description, status, dueDate, createdById, assignedToId, completedById, completedAt

### Materials
- id, name, quantity, unit, notes, status, createdById

### ActivityLog
- id, userId, entityType, entityId, action, changes

Alle Tabellen haben `createdAt` und `updatedAt` Timestamps.

## 🎨 Verwendung

1. **Anmelden**: Mit einem der initialen Benutzer anmelden
2. **Dashboard**: Überblick über Aufgaben und Materialien
3. **Aufgaben erstellen**: Neue Aufgaben anlegen
4. **Aufgabe übernehmen**: Aufgabe "in Bearbeitung" ziehen
5. **Material hinzufügen**: Benötigte Materialien eintragen
6. **Status ändern**: Materialstatus auf "Bestellt" oder "Eingetroffen" setzen
7. **Benutzer verwalten**: Als Admin neue Benutzer anlegen (Admin-Seite)

## 🔧 Entwicklung

### Backend Development
```bash
cd backend
npm run dev  # Startet Server mit --watch flag
```

### Frontend Development
```bash
cd frontend
npm run dev  # Startet Vite Dev Server mit HMR
```

### Production Build
```bash
cd frontend
npm run build  # Erstellt optimierten Production Build
```

## 📝 Hinweise

- Die SQLite-Datenbank wird als `backend/database.sqlite` erstellt
- JWT-Token sind 7 Tage gültig
- Passwörter werden mit bcrypt gehasht (10 Rounds)
- Activity Logs werden automatisch für alle Änderungen erstellt
- Admin kann Aufgaben löschen und Benutzer zuweisen
- Helfer können Aufgaben erstellen und übernehmen

## 🔐 Sicherheit

- Alle API-Endpunkte (außer Login) erfordern JWT-Authentifizierung
- Passwörter werden nie im Klartext gespeichert
- Rollen-Prüfung erfolgt serverseitig
- CORS ist aktiviert für Frontend-Zugriff
- Input-Validierung mit express-validator

## 📄 Lizenz

MIT
