export type TransactionType = 'Ausgabe' | 'Einnahme';

export type RecurrenceInterval = 'monatlich' | 'jeden zweiten Monat' | 'quartalsweise' | 'jährlich';


export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export interface Data {
    categories?: Category[];
    transactions?: Transaction[];
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    description?: string;
    date: string;



    isRecurring: boolean;
    recurrenceInterval?: RecurrenceInterval;
    recurrenceEndDate?: string;
    recurrenceParentId?: string;

    createdAt: string;
    updatedAt: string;
}

export interface TransactionFilter {
    from?: string;
    to?: string;
    categoryId?: string;
    type?: TransactionType;
}

export interface ForecastEntry {
    month: string;
    categoryId?: string;
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

export interface FinanceSummary {
    totalTransactions: number;
    totalExpenseSum: number;
    totalIncomeSum: number;
    currentBalance: number;
}

export interface ExpenseOverviewProps {
    categories?: Category[];
    transactions?: Transaction[];

    selectedCategoryId: string;

    onSelectCategory: (id: string) => void;
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
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export interface CategoryGroupCardProps {
    group: CategoryGroup;
    categoryMap: Map<string, Category>;
}


export interface AddEntryProps {
    onAdd: (transaction: NewTransaction) => void;
}



export interface SelectedPeriod {
    year: number;
    month: number | null;
}


export interface SideDateOption {
    value: number | null;
    label: string;
}

export interface SideDateProps {
    title: string;
    options: SideDateOption[];
    selectedValue: number | null;
    onSelect: (value: number | null) => void;
}


export interface SidebarProps {
    years: number[];
    selectedPeriod: SelectedPeriod;
    onSelectPeriod: (period: SelectedPeriod) => void;
}



