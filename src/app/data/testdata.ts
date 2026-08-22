import { Category, Transaction } from '../interfaces/interfaces';


export const testCategories: Category[] = [
  {
    id: '1',
    name: 'Wohnen',
    icon: '🏠',
    color: '#185FA5',

  },
  {
    id: '2',
    name: 'Lebensmittel',
    icon: '🛒',
    color: '#3B6D11',

  },
  {
    id: '3',
    name: 'Freizeit',
    icon: '🎮',
    color: '#854F0B',

  },
  {
    id: '4',
    name: 'Mobilität',
    icon: '🚗',
    color: '#534AB7',

  },
  {
    id: '5',
    name: 'Gesundheit',
    icon: '🏥',
    color: '#A32D2D',
  },
  {
    id: '6',
    name: 'Versicherungen',
    icon: '🛡️',
    color: '#5F5E5A',
  },
  {
    id: '7',
    name: 'Sparen & Anlegen',
    icon: '🐷',
    color: '#993C1D',

  },
  {
    id: '8',
    name: 'Bildung',
    icon: '📚',
    color: '#993556',

  },
  {
    id: '9',
    name: 'Shopping',
    icon: '🛍️',
    color: '#3C3489',
  },
  {
    id: '10',
    name: 'Drogerie',
    icon: '🧴',
    color: '#791F1F',
  },
  {
    id: '11',
    name: 'Urlaub',
    icon: '✈️',
    color: '#712B13',
  },
  {
    id: '12',
    name: 'Geschenke',
    icon: '🎁',
    color: '#72243E',
  },
  {
    id: '13',
    name: 'Spenden',
    icon: '💛',
    color: '#633806',
  },
  {
    id: 'c14',
    name: 'Sonstiges',
    icon: '📦',
    color: '#444441',
  },
  {
    id: '15',
    name: 'Gehalt & Zinsen',
    icon: '💶',
    color: '#04342C',
  },
  {
    id: '16',
    name: 'Miete',
    icon: '🔑',
    color: '#085041',
  },
];

export const testTransactions: Transaction[] = [
  // Standard-Ausgabe, alle Felder gesetzt, nicht wiederkehrend
  {
    id: 'tx-1',
    type: 'Ausgabe',
    amount: 45.99,
    categoryId: '2',
    description: 'Wocheneinkauf Edeka',
    date: '2025-08-01',
    isRecurring: false,
    createdAt: '2025-08-01T09:12:00Z',
    updatedAt: '2025-08-01T09:12:00Z',
  },
  // Ausgabe ohne description (optionales Feld fehlt)
  {
    id: 'tx-2',
    type: 'Ausgabe',
    amount: 12.5,
    categoryId: '3',
    date: '2025-08-03',
    isRecurring: false,
    createdAt: '2025-08-03T18:40:00Z',
    updatedAt: '2025-08-03T18:40:00Z',
  },
  // Wiederkehrende Ausgabe, monatlich, ohne Enddatum
  {
    id: 'tx-3',
    type: 'Ausgabe',
    amount: 850,
    categoryId: '16',
    description: 'Miete August',
    date: '2025-08-01',
    isRecurring: true,
    recurrenceInterval: 'monatlich',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
  },
  // Automatisch generierte Instanz der Miete (recurrenceParentId gesetzt)
  {
    id: 'tx-3b',
    type: 'Ausgabe',
    amount: 850,
    categoryId: '11',
    description: 'Urlaub',
    date: '2025-09-01',
    isRecurring: false,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  // Wiederkehrend, quartalsweise, mit Enddatum
  {
    id: 'tx-4',
    type: 'Ausgabe',
    amount: 29.99,
    categoryId: '3',
    description: 'Streaming-Abo',
    date: '2025-08-05',
    isRecurring: true,
    recurrenceInterval: 'quartalsweise',
    recurrenceEndDate: '2026-08-05',
    createdAt: '2025-08-05T00:00:00Z',
    updatedAt: '2025-08-05T00:00:00Z',
  },
  // Wiederkehrend, jeden zweiten Monat
  {
    id: 'tx-5',
    type: 'Ausgabe',
    amount: 60,
    categoryId: '16',
    description: 'Fitnessstudio (Beitrag alle 2 Monate)',
    date: '2025-08-10',
    isRecurring: true,
    recurrenceInterval: 'jeden zweiten Monat',
    createdAt: '2025-08-10T00:00:00Z',
    updatedAt: '2025-08-10T00:00:00Z',
  },
  
  {
    id: 'tx-6',
    type: 'Ausgabe',
    amount: 120,
    categoryId: '6',
    description: 'Versicherung',
    date: '2025-01-15',
    isRecurring: true,
    recurrenceInterval: 'jährlich',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  // Einnahme, wiederkehrend, monatlich
  {
    id: 'tx-7',
    type: 'Einnahme',
    amount: 2800,
    categoryId: '15',
    description: 'Gehalt',
    date: '2025-08-27',
    isRecurring: true,
    recurrenceInterval: 'monatlich',
    createdAt: '2025-08-27T00:00:00Z',
    updatedAt: '2025-08-27T00:00:00Z',
  },
  // Einmalige Einnahme, alles minimal (kein description)
  {
    id: 'tx-8',
    type: 'Einnahme',
    amount: 150,
    categoryId: '15',
    date: '2025-08-14',
    isRecurring: false,
    createdAt: '2025-08-14T00:00:00Z',
    updatedAt: '2025-08-14T00:00:00Z',
  },
];