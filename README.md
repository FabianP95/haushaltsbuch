# Haushaltsbuch

## Projektüberblick

Ein digitales Haushaltsbuch als Webanwendung. Die Oberfläche zeigt Einnahmen und Ausgaben anhand von Kategorien und berechnet Kennzahlen wie Einnahmen, Ausgaben und Kontostand. Das Projekt basiert auf Next.js mit React, TypeScript und Sass.

Der aktuelle Stand ist ein Frontend-Prototyp: Die Übersicht verwendet Beispieldaten aus `src/app/data/testdata.ts`. Das Formular zum Hinzufügen einer Buchung ist vorhanden und prüft Eingaben, speichert die Buchung aber noch nicht in der Übersicht oder dauerhaft. Es gibt derzeit keine erkennbare Datenbank- oder Backend-Anbindung.

## Projektstruktur

```text
haushaltsbuch/
├── public/
│   ├── assets/icons/        Öffentliche Icons und Bilddateien
│   └── fonts/               Lokal abgelegte Schriftdateien
├── src/
│   ├── app/
│   │   ├── components/      UI-Bausteine der Anwendung
│   │   ├── data/             Beispieldaten für Kategorien und Buchungen
│   │   ├── interfaces/       TypeScript-Datentypen und Props
│   │   ├── styles/           SCSS-Teilstile und zentrale Stildefinitionen
│   │   ├── globals.scss      Globale SCSS-Einstiegsdatei
│   │   ├── layout.tsx        Root-Layout und Metadaten
│   │   ├── page.tsx          Startseite und Zusammensetzung der Hauptansicht
│   │   └── page.module.scss  Layout-Stile der Startseite
│   └── utils/
│       └── currency.ts       Hilfsfunktionen für Währungswerte
├── package.json              Abhängigkeiten und npm-Skripte
├── next.config.ts            Next.js-Konfiguration
├── tsconfig.json             TypeScript-Konfiguration
└── eslint.config.mjs         ESLint-Konfiguration
```

## Wo liegt welche Funktion?

- `src/app/page.tsx`: setzt Sidebar, Navbar, Buchungsübersicht und Formular zusammen; hält die zusammengefassten Finanzkennzahlen im Seitenzustand.
- `src/app/components/overview/expense-overview.tsx`: filtert Buchungen nach Kategorie, gruppiert sie und berechnet Summen und Kontostand.
- `src/app/components/overview/category-group/`: Darstellung einer Kategoriegruppe und einzelner Buchungen.
- `src/app/components/overview/filterbar/`: Auswahl der anzuzeigenden Kategorie.
- `src/app/components/navbar/`: Kopfbereich mit Kennzahlen; `overview-header/` enthält den Header der Übersicht.
- `src/app/components/sidebar/`: Seitenleiste und Datumsnavigation.
- `src/app/components/add-entry/`: Formular zum Anlegen einer Buchung, Eingabevalidierung, Umschaltung zwischen Einnahme und Ausgabe sowie Felder für Wiederholungen.
- `src/app/data/testdata.ts`: Testkategorien und Testbuchungen, die aktuell als Standarddaten der Übersicht dienen.
- `src/app/interfaces/interfaces.ts`: gemeinsame Typen, unter anderem für Kategorien, Buchungen, Filter und Finanzübersicht.
- `src/app/styles/`, `src/app/globals.scss` und `*.module.scss`: globale und komponentenbezogene Sass-Stile.
- `src/utils/currency.ts`: Währungsformatierung bzw. zugehörige Hilfsfunktionen.

## Aktueller Funktionsstand

- Die Startseite zeigt die Finanzübersicht mit Kategorien, Beispielbuchungen und Kennzahlen.
- Einnahmen und Ausgaben werden im Datentyp unterschieden; wiederkehrende Intervalle sind modelliert.
- Die Übersicht lässt sich nach Kategorie filtern und aktualisiert die angezeigten Summen.
- Das Formular unterstützt Buchungsart, Betrag, Kategorie, Datum, optionale Beschreibung und Wiederholung.
- Formularvalidierung ist vorhanden. Beim Absenden wird die Buchung aktuell lediglich in der Konsole ausgegeben; es gibt noch keinen gemeinsamen Datenfluss zurück zur Übersicht.
- Datenhaltung ist derzeit auf statische Beispieldaten und lokalen React-Zustand beschränkt.

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
- `npm run lint`: prüft den Code mit ESLint.

## Weitere To-dos / Ziele

- Daten sollen in einem eigenen Backend gespeichert werden
- Daten sollen entweder nach Jahren oder Monaten angezeigt werden können
- Daten sollen für einen bestimmten Zeitraum als graphisches Element dargestellt werden können, per Klick auf den Diagramm Button