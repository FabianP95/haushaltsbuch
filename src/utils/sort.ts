import { SortOptionItem, Transaction, TransactionSortOption } from '@/app/interfaces/interfaces';


export const DEFAULT_SORT_OPTION: TransactionSortOption = 'date-desc';


export const SORT_OPTIONS: SortOptionItem[] = [
    { value: 'date-desc', label: 'Datum: neu → alt' },
    { value: 'date-asc', label: 'Datum: alt → neu' },
    { value: 'amount-desc', label: 'Betrag: hoch → niedrig' },
    { value: 'amount-asc', label: 'Betrag: niedrig → hoch' },
];

/**
 * Type guard that checks whether a string (e.g. from a <select>) is a valid sort option.
 * @param value - Raw value to check
 * @returns `true` if the value is one of the known sort options
 */
export function isSortOption(value: string): value is TransactionSortOption {
    return SORT_OPTIONS.some((option) => option.value === value);
}

/**
 * Returns a sorted copy of the transactions; the original array stays untouched.
 * Dates are compared as ISO strings ("YYYY-MM-DD"), which sort correctly as plain text.
 * @param transactions - Transactions to sort
 * @param option - Selected sort order
 * @returns A new, sorted array
 */
export function sortTransactions(transactions: Transaction[], option: TransactionSortOption): Transaction[] {
    return transactions.toSorted((a, b) => {
        switch (option) {
            case 'date-asc':
                return a.date.localeCompare(b.date);
            case 'date-desc':
                return b.date.localeCompare(a.date);
            case 'amount-asc':
                return a.amount - b.amount;
            case 'amount-desc':
                return b.amount - a.amount;
        }
    });
}
