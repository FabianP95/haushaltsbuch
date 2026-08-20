import { Category, Transaction } from '../interfaces/interfaces';

export const testCategories: Category[] = [
  { id: 'cat-1', name: 'Wohnen', icon: '🏠', color: '#4A90D9', isDefault: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-1a', name: 'Miete', icon: '🔑', color: '#4A90D9', isDefault: false, parentId: 'cat-1', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-1b', name: 'Nebenkosten', isDefault: false, parentId: 'cat-1', createdAt: '2024-01-01T00:00:00Z' }, // ohne icon/color
  { id: 'cat-2', name: 'Lebensmittel', icon: '🛒', color: '#7ED957', isDefault: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Freizeit', icon: '🎮', color: '#F5A623', isDefault: false, createdAt: '2024-03-15T00:00:00Z' },
  { id: 'cat-4', name: 'Gehalt', icon: '💶', color: '#50E3C2', isDefault: true, createdAt: '2024-01-01T00:00:00Z' },
];

export const testTransactions: Transaction[] = [
  // Standard-Ausgabe, alle Felder gesetzt, nicht wiederkehrend
  {
    id: 'tx-1',
    type: 'Ausgabe',
    amount: 45.99,
    categoryId: 'cat-2',
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
    categoryId: 'cat-3',
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
    categoryId: 'cat-1a',
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
    categoryId: 'cat-1a',
    description: 'Miete September',
    date: '2025-09-01',
    isRecurring: true,
    recurrenceInterval: 'monatlich',
    recurrenceParentId: 'tx-3',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  // Wiederkehrend, quartalsweise, mit Enddatum
  {
    id: 'tx-4',
    type: 'Ausgabe',
    amount: 29.99,
    categoryId: 'cat-1b',
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
    categoryId: 'cat-3',
    description: 'Fitnessstudio (Beitrag alle 2 Monate)',
    date: '2025-08-10',
    isRecurring: true,
    recurrenceInterval: 'jeden zweiten Monat',
    createdAt: '2025-08-10T00:00:00Z',
    updatedAt: '2025-08-10T00:00:00Z',
  },
  // Wiederkehrend, järhlich (Tippfehler im Interface übernommen!)
  {
    id: 'tx-6',
    type: 'Ausgabe',
    amount: 120,
    categoryId: 'cat-1b',
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
    categoryId: 'cat-4',
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
    categoryId: 'cat-4',
    date: '2025-08-14',
    isRecurring: false,
    createdAt: '2025-08-14T00:00:00Z',
    updatedAt: '2025-08-14T00:00:00Z',
  },
];