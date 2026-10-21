import { SelectedPeriod, SideDateOption, Transaction } from '@/app/interfaces/interfaces';

export const MONTHS_PER_YEAR = 12;

/**
 * Reads year and month directly from the ISO string "YYYY-MM-DD" to avoid timezone shifts of `new Date('YYYY-MM-DD')`.
 * @param date - ISO date string, e.g. "2026-03-15"
 * @returns The year and the 1-based month
 */
export function getYearAndMonth(date: string): { year: number; month: number } {
    const [year, month] = date.split('-').map(Number);
    return { year, month };
}

/**
 * Reads the day of the month directly from the ISO string "YYYY-MM-DD".
 * @param date - ISO date string, e.g. "2026-03-15"
 * @returns The day of the month, e.g. 15
 */
export function getDayOfMonth(date: string): number {
    return Number(date.split('-')[2]);
}

/**
 * Returns how many days a month has, leap years included.
 * @param year - Full year, e.g. 2026
 * @param month - 1-based month number (1-12)
 * @returns Number of days, e.g. 28, 29, 30 or 31
 */
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

/**
 * Collects every year that has bookings plus the current year, without duplicates, newest first.
 * @param transactions - All transactions to scan for years
 * @param currentYear - Year that is always included, even without bookings
 * @returns Unique years sorted in descending order
 */
export function getAvailableYears(transactions: Transaction[], currentYear: number): number[] {
    const years = new Set<number>([currentYear]);
    transactions.forEach((t) => years.add(getYearAndMonth(t.date).year));
    return [...years].toSorted((a, b) => b - a);
}

/**
 * Returns the German month name, e.g. 1 -> "Januar".
 * @param monthNumber - 1-based month number (1-12)
 * @returns The month name in German
 */
export function getMonthName(monthNumber: number): string {
    return new Date(2000, monthNumber - 1, 1).toLocaleDateString('de-DE', { month: 'long' });
}

/**
 * Returns the short German month name, e.g. 3 -> "März", 10 -> "Okt.".
 * @param monthNumber - 1-based month number (1-12)
 * @returns The abbreviated month name in German
 */
export function getShortMonthName(monthNumber: number): string {
    return new Date(2000, monthNumber - 1, 1).toLocaleDateString('de-DE', { month: 'short' });
}

/**
 * Builds a readable label for the selected period, e.g. "Mai 2026" or "2026" for the whole year.
 * @param period - Selected year and month (`month: null` means the whole year)
 * @returns The period label
 */
export function getPeriodLabel(period: SelectedPeriod): string {
    return period.month === null ? String(period.year) : `${getMonthName(period.month)} ${period.year}`;
}

/**
 * Builds the 12 month options (value 1-12) for the sidebar.
 * @returns One option per month with its number and German label
 */
export function getMonthOptions(): SideDateOption[] {
    return Array.from({ length: MONTHS_PER_YEAR }, (_, index) => ({
        value: index + 1,
        label: getMonthName(index + 1)
    }));
}

/**
 * Checks whether an ISO date lies in the selected year and (if set) the selected month.
 * @param date - ISO date string, e.g. "2026-03-15"
 * @param period - Selected year and month (`month: null` means the whole year)
 * @returns `true` if the date is inside the period
 */
export function isInPeriod(date: string, period: SelectedPeriod): boolean {
    const { year, month } = getYearAndMonth(date);
    if (year !== period.year) return false;
    return period.month === null || month === period.month;
}

/**
 * Applies time filter and category filter in one place.
 * @param transactions - All transactions to filter
 * @param period - Selected year and month
 * @param categoryId - Category id to keep, or 'all' for no category restriction
 * @returns Only the transactions matching both filters
 */
export function filterTransactions(
    transactions: Transaction[],
    period: SelectedPeriod,
    categoryId: string
): Transaction[] {
    return transactions.filter(
        (t) => isInPeriod(t.date, period) && (categoryId === 'all' || t.categoryId === categoryId)
    );
}
