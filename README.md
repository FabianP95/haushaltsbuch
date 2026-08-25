# Haushaltsbuch

Dieses Projekt ist die Umsetzung eines digitalen Haushaltsbuchs mit Next.js und React. Einnahmen und Ausgaben werden übersichtlich nach Kategorien dargestellt, damit der aktuelle Kontostand und die finanzielle Entwicklung schnell erfasst werden können.

## Funktionen

- Übersicht über Einnahmen, Ausgaben, Kontostand und Transaktionen
- Gruppierung der Buchungen nach Kategorien
- Filterung der Übersicht nach einzelnen Kategorien
- Responsive Oberfläche für die tägliche Nutzung

Die Anwendung verwendet derzeit Beispieldaten aus `src/app/data/testdata.ts`. Die Funktion zum Hinzufügen neuer Buchungen wird im weiteren Projektverlauf ergänzt.

## Entwicklung starten

Abhängigkeiten installieren:

```bash
npm install
```

Entwicklungsserver starten:

```bash
npm run dev
```

Anschließend ist die Anwendung unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Verfügbare Skripte

- `npm run dev` startet den Entwicklungsserver.
- `npm run build` erstellt einen Produktions-Build.
- `npm run start` startet die Anwendung im Produktionsmodus.
- `npm run lint` prüft den Code mit ESLint.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
