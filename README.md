# Haushaltsbuch

## Projektüberblick

Ein digitales Haushaltsbuch als Webanwendung. Einnahmen und Ausgaben werden in Kategorien erfasst, nach Zeitraum gefiltert, als Liste oder in Diagrammen ausgewertet und mit Kennzahlen wie Einnahmen, Ausgaben und Kontostand zusammengefasst. Das Projekt basiert auf Next.js mit React, TypeScript, Sass und Recharts.

Alle Daten liegen in einer lokalen SQLite-Datenbank (`data/haushaltsbuch.db`) auf dem PC, der den Server ausführt. Weitere Geräte im Heimnetz, z. B. ein iPad, öffnen die App im Browser und arbeiten mit denselben Daten. Der Zugriff läuft über Next.js Server Actions in `src/app/data/data.ts`. SQLite ist über das in Node.js eingebaute Modul `node:sqlite` angebunden, ein zusätzliches Package ist nicht nötig. Beim ersten Start wird die Datenbank automatisch angelegt und mit den Kategorien aus `src/app/data/testdata.ts` befüllt.

## Projektstruktur

```text
haushaltsbuch/
├── .github/workflows/        CI-Pipeline (Lint, Typecheck, Tests, Build)
├── data/                     SQLite-Datenbank (wird zur Laufzeit erzeugt, nicht im Repo)
├── public/
│   ├── assets/icons/         Öffentliche Icons
│   └── fonts/                Lokal abgelegte Schriftdateien
├── src/
│   ├── app/
│   │   ├── components/       UI-Bausteine der Anwendung
│   │   ├── data/             Datenbankanbindung (SQLite), Server Actions, Konfiguration und Beispieldaten
│   │   ├── interfaces/       TypeScript-Datentypen und Props
│   │   ├── globals.scss      Globale SCSS-Einstiegsdatei
│   │   ├── layout.tsx        Root-Layout und Metadaten
│   │   ├── page.tsx          Startseite, zentraler Zustand und Zusammensetzung der Hauptansicht
│   │   └── page.module.scss  Layout-Stile der Startseite
│   ├── styles/               SCSS-Variablen, Mixins und Typografie
│   ├── tests/                Vitest-Tests für die Hilfsfunktionen
│   └── utils/                Reine Hilfsfunktionen (Filter, Suche, Sortierung, Diagrammdaten, Währung, Kategorien)
├── package.json              Abhängigkeiten und npm-Skripte
├── next.config.ts            Next.js-Konfiguration
├── vitest.config.mts         Vitest-Konfiguration
├── tsconfig.json             TypeScript-Konfiguration
└── eslint.config.mjs         ESLint-Konfiguration
```

## Wo liegt welche Funktion?

- `src/app/page.tsx`: lädt die Daten (erneut, sobald der Tab wieder sichtbar wird), hält Buchungen, Kategorien, Zeitraum-, Kategorie- und Ansichtsauswahl im Zustand, berechnet die Kennzahlen und verbindet alle Komponenten.
- `src/app/data/db.ts`: öffnet die SQLite-Datenbank, legt die Tabellen an, befüllt eine leere Datenbank mit den Standardkategorien und wandelt Datenbankzeilen in `Category`/`Transaction` um.
- `src/app/data/data.ts`: Server Actions zum Lesen und Schreiben von Buchungen und Kategorien (Anlegen, Ändern, Löschen).
- `src/app/components/sidebar/`: Zeitraumauswahl nach Jahr und optional Monat.
- `src/app/components/navbar/`: Kopfbereich mit Kennzahlen und Umschaltung zwischen Listen- und Diagrammansicht.
- `src/app/components/overview/`: Buchungsübersicht mit Kategoriefilter (`filterbar/`), Suche, Sortierung, Kategoriegruppen inklusive Budgetanzeige (`category-group/`) und einzelnen Buchungen mit Bearbeiten/Löschen (`transaction-item/`).
- `src/app/components/charts/`: Diagrammansicht mit Säulen-, Kreis-, Sankey- und Liniendiagramm (Recharts).
- `src/app/components/add-entry/`: ein- und ausklappbares Formular zum Anlegen und Bearbeiten von Buchungen inklusive Validierung und Wiederholungsfeldern.
- `src/app/components/category-manager/`: ein- und ausklappbare Kategorienverwaltung mit Monatsbudget.
- `src/app/interfaces/interfaces.ts`: gemeinsame Typen für Kategorien, Buchungen, Filter, Diagramme und Props.
- `src/utils/`: `date-filter.ts`, `search.ts`, `sort.ts`, `chart-data.ts`, `category.ts` und `currency.ts` als testbare Hilfsfunktionen.
- `src/tests/`: Unit-Tests für die Hilfsfunktionen.

## Funktionsumfang

- **Buchungen:** Einnahmen und Ausgaben anlegen, bearbeiten und löschen – mit Betrag, Kategorie, Datum, optionaler Beschreibung und optionaler Wiederholung (Intervall und Enddatum). Eingaben werden validiert.
- **Direkt in Kategorie anlegen:** Über den Hinzufügen-Button einer Kategorie öffnet sich das Formular mit vorausgewählter Kategorie.
- **Persistenz und Synchronisation:** Alle Änderungen werden in der SQLite-Datenbank auf dem PC gespeichert. Alle Geräte im Heimnetz sehen denselben Stand.
- **Zeitfilter:** Auswahl eines Jahres und optional eines Monats in der Sidebar; Liste, Kennzahlen und Diagramme passen sich an.
- **Kategoriefilter, Suche und Sortierung:** Buchungen nach Kategorie filtern, nach Beschreibung oder Betrag durchsuchen und nach Datum oder Betrag auf- bzw. absteigend sortieren.
- **Kennzahlen:** Anzahl der Buchungen, Gesamteinnahmen, Gesamtausgaben und Kontostand für den gewählten Zeitraum.
- **Diagramme:** Säulendiagramm (Einnahmen und Ausgaben pro Monat), Kreisdiagramm (Ausgaben nach Kategorie, Klick filtert die Liste), Sankey-Diagramm (Geldfluss) und Liniendiagramm (Verlauf nach Kategorie).
- **Kategorien verwalten:** Kategorien anlegen, umbenennen und löschen; beim Löschen werden vorhandene Buchungen in eine gewählte Zielkategorie verschoben.
- **Budgets:** Monatsbudget pro Kategorie mit Anzeige der Auslastung sowie Warnung bei Annäherung und Überschreitung.
- **Einklappbare Seitenbereiche:** Buchungsformular und Kategorienverwaltung lassen sich per Klick ein- und ausklappen.

## Entwicklung

Abhängigkeiten installieren und den Entwicklungsserver starten:

```bash
npm install
npm run dev
```

Die Anwendung ist anschließend unter [http://localhost:3000](http://localhost:3000) erreichbar.

Verfügbare Skripte:

- `npm run dev`: startet den Entwicklungsserver.
- `npm run build`: erstellt einen Produktions-Build.
- `npm run start`: startet die Anwendung im Produktionsmodus.
- `npm run serve:lan`: erstellt einen Produktions-Build und startet den Server für alle Geräte im Heimnetz.
- `npm run lint`: prüft den Code mit ESLint.
- `npm run test`: startet Vitest im Watch-Modus.
- `npm run test:ci`: führt alle Tests einmalig aus (wie in der CI).

Voraussetzung ist Node.js 24 oder neuer, wegen `node:sqlite`.

## Nutzung im Heimnetz (PC als Server, iPad als Client)

Der Next.js-Server läuft auf dem PC und liefert das Frontend an alle Geräte im selben Netz aus. Die Server Actions laufen auf dem PC und schreiben in `data/haushaltsbuch.db`. Auf dem iPad wird nichts installiert.

```text
iPad (Safari)  ──WLAN──►  Router  ──LAN──►  PC: Next.js-Server (Port 3000)
                                             └─ data/haushaltsbuch.db
```

PC per LAN und iPad per WLAN funktionieren problemlos, solange beide am selben Router hängen. Das iPad darf **nicht** im Gast-WLAN sein.

### Einrichtung am PC (einmalig)

1. **Netzwerkprofil auf „Privat“ stellen:** Einstellungen → Netzwerk und Internet → Ethernet bzw. WLAN → Netzwerkprofiltyp → *Privates Netzwerk*.
2. **Firewall für Port 3000 öffnen** (PowerShell als Administrator):
   ```powershell
   New-NetFirewallRule -DisplayName "Haushaltsbuch" -Direction Inbound -Protocol TCP -LocalPort 3000 -Profile Private -Action Allow
   ```
3. **IP-Adresse ermitteln:** `ipconfig` ausführen und die IPv4-Adresse ablesen, z. B. `192.168.178.20`.
4. **IP-Adresse festlegen:** Im Router dem PC immer dieselbe IP zuweisen. Bei einer FRITZ!Box geht das unter Heimnetz → Netzwerk → Gerät → „Diesem Netzwerkgerät immer die gleiche IPv4-Adresse zuweisen“. Alternativ lässt sich der Gerätename verwenden, z. B. `http://<pc-name>.fritz.box:3000`. Den Namen zeigt `hostname` an.

Die IP-Adresse wird nirgends im Code eingetragen. Der Server lauscht mit `-H 0.0.0.0` auf allen Netzwerkadressen des PCs.

### Server starten

```bash
npm run serve:lan
```

Der Server läuft, solange das Terminal geöffnet ist. Wenn sich am Code nichts geändert hat, startet `npx next start -H 0.0.0.0` ohne erneuten Build schneller.

### Auf dem iPad

1. In Safari `http://<PC-IP>:3000` öffnen, mit `http://` und nicht `https://`.
2. Teilen → „Zum Home-Bildschirm“. Danach startet die App direkt über das Symbol.

Änderungen von einem Gerät erscheinen auf dem anderen, sobald dort die App wieder geöffnet bzw. der Tab wieder sichtbar wird.

### Fehlersuche

- Am PC selbst `http://<PC-IP>:3000` öffnen, also mit der IP statt `localhost`. Klappt das am PC, aber nicht am iPad, liegt es an der Firewall oder am Netzwerkprofil.
- Die IP-Adressen beider Geräte sollten gleich beginnen, z. B. `192.168.178.x`. Am iPad: Einstellungen → WLAN → (i).

### Grenzen und Backup

- Das iPad erreicht die App nur, wenn der PC läuft und beide Geräte im selben Netz sind.
- Es gibt keinen Login: Jedes Gerät im Heimnetz kann die App öffnen.
- Die Datenbankdatei ist über `.gitignore` vom Repository ausgeschlossen. Für ein Backup regelmäßig `data/haushaltsbuch.db` kopieren, z. B. nach OneDrive.

## Mögliche Erweiterungen

- Zugriff von unterwegs, z. B. über Tailscale
- Login bzw. Zugriffsschutz
- CSV-Export und -Import (aktuell ohne Priorität)
