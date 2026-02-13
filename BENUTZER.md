# Benutzer-Accounts

## Standard-Benutzer

Nach dem Seeding (`npm run seed`) stehen folgende Benutzer zur Verfügung:

### Administrator
| Benutzername | Passwort | Rolle | Rechte |
|--------------|----------|-------|--------|
| admin | admin123 | Admin | Volle Rechte: Benutzer verwalten, Aufgaben löschen, Materialien löschen, Aufgaben zuweisen |

### Helfer (Mitarbeiter)
| Benutzername | Passwort | Rolle | Beschreibung |
|--------------|----------|-------|--------------|
| Lina | lina123 | Helfer | Kann Aufgaben erstellen, übernehmen, erledigen. Kann Materialien erstellen und Status ändern. |
| Max | max123 | Helfer | Kann Aufgaben erstellen, übernehmen, erledigen. Kann Materialien erstellen und Status ändern. |
| Sarah | sarah123 | Helfer | Kann Aufgaben erstellen, übernehmen, erledigen. Kann Materialien erstellen und Status ändern. |
| Tom | tom123 | Helfer | Kann Aufgaben erstellen, übernehmen, erledigen. Kann Materialien erstellen und Status ändern. |

## Neue Benutzer hinzufügen

### Methode 1: Als Admin in der Web-App

1. Login als `admin` / `admin123`
2. Navigiere zu "Benutzer" (nur für Admin sichtbar)
3. Klicke "+ Neuer Benutzer"
4. Fülle das Formular aus:
   - Benutzername (z.B. "Julia")
   - E-Mail (z.B. "julia@baustelle.local")
   - Passwort (z.B. "julia123")
   - Rolle: Helfer oder Admin
5. Klicke "Erstellen"

### Methode 2: Seeder-Script erweitern

Bearbeite `backend/utils/seeders.js` und füge neue Benutzer zum `helpers` Array hinzu:

```javascript
const helpers = [
  { username: 'Lina', email: 'lina@baustelle.local', password: 'lina123' },
  { username: 'Max', email: 'max@baustelle.local', password: 'max123' },
  { username: 'Sarah', email: 'sarah@baustelle.local', password: 'sarah123' },
  { username: 'Tom', email: 'tom@baustelle.local', password: 'tom123' },
  // Neuer Benutzer hinzufügen:
  { username: 'Julia', email: 'julia@baustelle.local', password: 'julia123' },
];
```

Dann führe aus:
```cmd
cd backend
npm run seed
```

**⚠️ ACHTUNG:** Dies löscht alle bestehenden Daten!

### Methode 3: Über die API

**POST** `/api/users` (als Admin)

Headers:
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

Body:
```json
{
  "username": "Julia",
  "email": "julia@baustelle.local",
  "password": "julia123",
  "role": "helper"
}
```

## Passwörter ändern

Aktuell gibt es keine Passwort-Änderungs-Funktion in der UI. 

Als Admin können Sie:
1. Den Benutzer löschen
2. Einen neuen Benutzer mit gleichem Namen und neuem Passwort erstellen

**Für Production:** Empfehlenswert ist die Implementierung einer Passwort-Änderungs-Funktion.

## Benutzer löschen

1. Login als Admin
2. Navigiere zu "Benutzer"
3. Klicke "Löschen" beim gewünschten Benutzer

**Hinweis:** Sie können sich nicht selbst löschen.

## Sicherheitshinweise

- **Ändern Sie die Standard-Passwörter** in einer Produktionsumgebung
- Verwenden Sie starke Passwörter (mindestens 8 Zeichen mit Buchstaben, Zahlen, Sonderzeichen)
- Die E-Mail-Adressen werden aktuell nicht verifiziert
- Alle Passwörter werden mit bcrypt gehasht (10 Rounds)
