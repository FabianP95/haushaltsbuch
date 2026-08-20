export type TransactionType = 'Ausgabe' | 'Einnahme';

export type RecurrenceInterval = 'monatlich' | 'jeden zweiten Monat' | 'quartalsweise' | 'jährlich';

// Eingabetyp fürs Anlegen einer Transaktion (ohne generierte Felder)
export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export type NewCategory = Omit<Category, 'id' | 'isDefault' | 'createdAt'>;

export interface Category {
    id: string;
    name: string;
    icon?: string; // Emoji oder Icon-Key fürs UI
    color?: string; // Hex-Farbe für Diagramme/Badges
    isDefault: boolean; // true = Grundstock-Kategorie, vom System angelegt
    parentId?: string; // optionale Ober-/Unterkategorie-Beziehung
    createdAt: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number; // immer positiv; Vorzeichen ergibt sich aus `type`
    categoryId: string;
    description?: string;
    date: string;

    // Wiederkehrende Ausgaben/Einnahmen

    isRecurring: boolean;
    recurrenceInterval?: RecurrenceInterval;
    recurrenceEndDate?: string; // optional, falls befristet
    recurrenceParentId?: string; // gesetzt bei automatisch generierten Instanzen

    createdAt: string;
    updatedAt: string;
}

export interface TransactionFilter {
    from?: string; // ISO-Datum, inklusive
    to?: string; // ISO-Datum, inklusive
    categoryId?: string;
    type?: TransactionType;
}

export interface ForecastEntry {
    month: string; // "YYYY-MM"
    categoryId?: string; // undefined = Gesamtsumme des Monats
    expectedIncome: number;
    expectedExpense: number;
    basis: 'wiederkehrend' | 'vergangener Durchschnitt' | 'Zusammengefasst';
}

export interface Categories {
    title: string
    category?: string

}

export interface Dates {
    title: string
    year?: number
    month?: string
}


