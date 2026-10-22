import type { ReactNode } from 'react';

export type TransactionType = 'Ausgabe' | 'Einnahme';

export type RecurrenceInterval = 'monatlich' | 'jeden zweiten Monat' | 'quartalsweise' | 'jährlich';


export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;


export type NewCategory = Omit<Category, 'id'>;


export type TransactionSortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';


export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Data {
    categories?: Category[];
    transactions?: Transaction[];
}

export interface Category {
    id: string;
    name: string;
    color: string;
    monthlyBudget?: number;
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
    selectedPeriod: SelectedPeriod;
    onSelectCategory: (id: string) => void;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (transaction: Transaction) => void;
    onAddToCategory: (categoryId: string) => void;
    onUpdateCategory: (category: Category) => void;
}


export interface TransactionItemProps {
    transaction: Transaction;
    categoryMap: Map<string, Category>;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
}

export interface CategoryGroup {
    category: Category;
    transactions: Transaction[];
    totalAmount: number;
    budgetUsage: BudgetUsage | null;
}

export interface BudgetUsage {
    spent: number;
    limit: number;
    percent: number;
    status: BudgetStatus;
}

export interface SortOptionItem {
    value: TransactionSortOption;
    label: string;
}

export interface CategoryManagerProps {
    categories: Category[];
    transactions: Transaction[];
    onCreate: (category: NewCategory) => void;
    onUpdate: (category: Category) => void;
    onDelete: (categoryId: string, targetCategoryId: string | null) => void;
}

export interface CategoryFilterBarProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelectCategory: (id: string) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortOption: TransactionSortOption;
    onSortChange: (option: TransactionSortOption) => void;
}

export interface CategoryGroupCardProps {
    group: CategoryGroup;
    categoryMap: Map<string, Category>;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (transaction: Transaction) => void;
    onAddToCategory: (categoryId: string) => void;
    onUpdateCategory: (category: Category) => void;
}


export interface FormPreset {
    version: number;
    editingTransaction: Transaction | null;
    categoryId?: string;
}


export interface AddEntryProps {
    categories: Category[];
    editingTransaction: Transaction | null;
    presetCategoryId?: string;
    onAdd: (transaction: NewTransaction) => void;
    onUpdate: (transaction: Transaction) => void;
    onCancel: () => void;
    // open state lives in the parent, so it survives the remount via `key`
    isOpen: boolean;
    onToggle: () => void;
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





export type MainView = 'list' | 'charts';


export interface MainViewOption {
    value: MainView;
    label: string;
    icon: string;
}


export interface NavbarProps extends FinanceSummary {
    activeView: MainView;
    onSelectView: (view: MainView) => void;
}


export type ChartType = 'bar' | 'pie' | 'sankey' | 'line';


export interface ChartTypeOption {
    value: ChartType;
    label: string;
}


export interface ChartSwitcherProps {
    activeChart: ChartType;
    onSelectChart: (chart: ChartType) => void;
}


export interface MonthlyTotal {
    month: number;
    label: string;
    income: number;
    expense: number;
}


export interface CategoryTotal {
    categoryId: string;
    name: string;
    color: string;
    amount: number;
    ratio: number;
}


export interface MoneyFlowNode {
    name: string;
    color: string;
}


export interface MoneyFlowLink {
    source: number;
    target: number;
    value: number;
}


export interface MoneyFlowData {
    nodes: MoneyFlowNode[];
    links: MoneyFlowLink[];
}


export interface ChartsProps {
    categories: Category[];
    transactions: Transaction[];
    selectedPeriod: SelectedPeriod;
    selectedCategoryId: string;
    onSelectCategory: (categoryId: string) => void;
}


export interface ChartCardProps {
    title: string;
    isEmpty: boolean;
    emptyMessage: string;
    children: ReactNode;
}


export interface MonthlyBarChartProps {
    data: MonthlyTotal[];
}


export interface CategoryPieChartProps {
    data: CategoryTotal[];
    total: number;
    onSelectCategory: (categoryId: string) => void;
}


export interface CategoryLegendProps {
    data: CategoryTotal[];
    onSelectCategory: (categoryId: string) => void;
}


export interface MoneyFlowSankeyProps {
    data: MoneyFlowData;
}


export interface CategoryTimelinePoint {
    label: string;
    values: Record<string, number>;
}


export interface CategoryTimeline {
    points: CategoryTimelinePoint[];
    series: CategoryTotal[];
}


export type TimelineMode = TransactionType | 'balance';


export interface CategoryLineChartProps {
    transactions: Transaction[];
    categories: Category[];
    period: SelectedPeriod;
}


export interface CategoryLineLegendProps {
    series: CategoryTotal[];
    highlightedId: string | null;
    onHighlight: (categoryId: string | null) => void;
}
