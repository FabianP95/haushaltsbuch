export type TransactionType = 'Ausgabe' | 'Einnahme';

export type RecurrenceInterval = 'monatlich' | 'jeden zweiten Monat' | 'quartalsweise' | 'jährlich';

// Eingabetyp fürs Anlegen einer Transaktion (ohne generierte Felder)
export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;



export interface Category {
    id: string;
    name: string;
    icon: string; 
    color: string; 
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

export interface ExpenseOverviewProps {
    categories?: Category[];
    transactions?: Transaction[];
}


export interface TransactionItemProps {
    transaction: Transaction;
    categoryMap: Map<string, Category>;
}

export interface CategoryGroup {
  category: Category;
  transactions: Transaction[];
  totalAmount: number;
}

export interface CategoryFilterBarProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelectCategory: (id: string) => void;
}

export interface CategoryGroupCardProps {
    group: CategoryGroup;
    categoryMap: Map<string, Category>;
}

