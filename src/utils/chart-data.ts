import { Category, CategoryTimeline, CategoryTimelinePoint, CategoryTotal, MoneyFlowData, MoneyFlowNode, MonthlyTotal, SelectedPeriod, TimelineMode, Transaction, TransactionType } from '@/app/interfaces/interfaces';
import { MONTHS_PER_YEAR, getDayOfMonth, getDaysInMonth, getShortMonthName, getYearAndMonth, isInPeriod } from './date-filter';
import { UNCATEGORIZED } from './category';


export const CHART_COLORS = {
    income: 'var(--chart-income)',
    expense: 'var(--chart-expense)',
    budget: 'var(--chart-budget)',
    link: 'var(--chart-link)',
};


export const BUDGET_NODE_NAME = 'Budget';
export const SURPLUS_NODE_NAME = 'Übrig / Sparen';
export const DEFICIT_NODE_NAME = 'Fehlbetrag';

/**
 * Rounds an amount to whole cents to avoid floating point leftovers like 0.30000000000000004.
 * @param amount - Amount to round
 * @returns The amount rounded to two decimals
 */
export function roundCents(amount: number): number {
    return Math.round(amount * 100) / 100;
}

/**
 * Formats a ratio as German percent with at most one decimal, e.g. 0.256 -> "25,6 %".
 * @param ratio - Share between 0 and 1
 * @returns The formatted percent string
 */
export function formatPercent(ratio: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 1 }).format(ratio);
}

/**
 * Sums income and expenses per month of the given year. Months without bookings stay at 0.
 * @param transactions - Transactions to sum (bookings of other years are ignored)
 * @param year - Year whose 12 months are built
 * @returns Exactly 12 entries, January to December
 */
export function getMonthlyTotals(transactions: Transaction[], year: number): MonthlyTotal[] {
    const months: MonthlyTotal[] = Array.from({ length: MONTHS_PER_YEAR }, (_, index) => ({
        month: index + 1,
        label: getShortMonthName(index + 1),
        income: 0,
        expense: 0,
    }));

    transactions.forEach((t) => {
        const { year: transactionYear, month } = getYearAndMonth(t.date);
        if (transactionYear !== year) return;

        const entry = months[month - 1];
        if (t.type === 'Einnahme') {
            entry.income += t.amount;
        } else {
            entry.expense += t.amount;
        }
    });

    return months.map((entry) => ({ ...entry, income: roundCents(entry.income), expense: roundCents(entry.expense) }));
}

/**
 * Sums the transactions of one type per category, biggest amount first.
 * Transactions whose category no longer exists are collected in "Ohne Kategorie".
 * @param transactions - Transactions to sum
 * @param categories - All categories (for name and color)
 * @param type - Only transactions of this type are counted
 * @returns One entry per category with an amount above 0, including its share of the total
 */
export function getCategoryTotals(
    transactions: Transaction[],
    categories: Category[],
    type: TransactionType
): CategoryTotal[] {
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const amounts = new Map<string, number>();

    transactions
        .filter((t) => t.type === type)
        .forEach((t) => {
            const categoryId = categoryMap.has(t.categoryId) ? t.categoryId : UNCATEGORIZED.id;
            amounts.set(categoryId, (amounts.get(categoryId) ?? 0) + t.amount);
        });

    const total = [...amounts.values()].reduce((sum, amount) => sum + amount, 0);

    return [...amounts.entries()]
        .filter(([, amount]) => amount > 0)
        .map(([categoryId, amount]) => {
            const category = categoryMap.get(categoryId) ?? UNCATEGORIZED;
            return {
                categoryId,
                name: category.name,
                color: category.color,
                amount: roundCents(amount),
                ratio: amount / total,
            };
        })
        .toSorted((a, b) => b.amount - a.amount);
}

/**
 * Builds nodes and links for the Sankey diagram: income categories → budget → expense categories.
 * A surplus flows into "Übrig / Sparen", a deficit flows in from an extra source "Fehlbetrag",
 * so the incoming and outgoing sums of the budget node are always equal.
 * @param transactions - Transactions of the selected period
 * @param categories - All categories (for name and color)
 * @returns Nodes and links; links reference nodes by their index in the `nodes` array
 */
export function getMoneyFlow(transactions: Transaction[], categories: Category[]): MoneyFlowData {
    const incomeTotals = getCategoryTotals(transactions, categories, 'Einnahme');
    const expenseTotals = getCategoryTotals(transactions, categories, 'Ausgabe');

    if (incomeTotals.length === 0 && expenseTotals.length === 0) {
        return { nodes: [], links: [] };
    }

    const nodes: MoneyFlowNode[] = [];
    const links: MoneyFlowData['links'] = [];

    const addNode = (node: MoneyFlowNode) => nodes.push(node) - 1;

    const incomeSum = roundCents(incomeTotals.reduce((sum, t) => sum + t.amount, 0));
    const expenseSum = roundCents(expenseTotals.reduce((sum, t) => sum + t.amount, 0));
    const difference = roundCents(incomeSum - expenseSum);

    const budgetIndex = addNode({ name: BUDGET_NODE_NAME, color: CHART_COLORS.budget });

    incomeTotals.forEach((income) => {
        const index = addNode({ name: income.name, color: income.color });
        links.push({ source: index, target: budgetIndex, value: income.amount });
    });

    if (difference < 0) {
        const deficitIndex = addNode({ name: DEFICIT_NODE_NAME, color: CHART_COLORS.expense });
        links.push({ source: deficitIndex, target: budgetIndex, value: -difference });
    }

    expenseTotals.forEach((expense) => {
        const index = addNode({ name: expense.name, color: expense.color });
        links.push({ source: budgetIndex, target: index, value: expense.amount });
    });

    if (difference > 0) {
        const surplusIndex = addNode({ name: SURPLUS_NODE_NAME, color: CHART_COLORS.income });
        links.push({ source: budgetIndex, target: surplusIndex, value: difference });
    }

    return { nodes, links };
}

/**
 * Calculates income minus expenses per category, highest balance first.
 * Transactions whose category no longer exists are collected in "Ohne Kategorie".
 * @param transactions - Transactions to sum
 * @param categories - All categories (for name and color)
 * @returns One entry per category with bookings; `ratio` is the share of the summed absolute balances
 */
export function getCategoryBalances(transactions: Transaction[], categories: Category[]): CategoryTotal[] {
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const balances = new Map<string, number>();

    transactions.forEach((t) => {
        const categoryId = categoryMap.has(t.categoryId) ? t.categoryId : UNCATEGORIZED.id;
        const signedAmount = t.type === 'Einnahme' ? t.amount : -t.amount;
        balances.set(categoryId, (balances.get(categoryId) ?? 0) + signedAmount);
    });

    const absoluteTotal = [...balances.values()].reduce((sum, balance) => sum + Math.abs(balance), 0);

    return [...balances.entries()]
        .map(([categoryId, balance]) => {
            const category = categoryMap.get(categoryId) ?? UNCATEGORIZED;
            return {
                categoryId,
                name: category.name,
                color: category.color,
                amount: roundCents(balance),
                ratio: absoluteTotal === 0 ? 0 : Math.abs(balance) / absoluteTotal,
            };
        })
        .toSorted((a, b) => b.amount - a.amount);
}

/**
 * Builds the running sum of every category over the selected period for the line chart.
 * In "balance" mode income counts positive and expenses negative, so a category shows its complete course.
 * A single month is split into its days, a whole year into its 12 months.
 * Transactions whose category no longer exists are collected in "Ohne Kategorie".
 * @param transactions - Transactions to sum (bookings outside the period are ignored)
 * @param categories - All categories (for name and color)
 * @param period - Selected year and month (`month: null` means the whole year)
 * @param mode - 'Ausgabe' or 'Einnahme' counts only that type, 'balance' calculates income minus expenses
 * @returns One point per day / month and one series per category with bookings
 */
export function getCategoryTimeline(
    transactions: Transaction[],
    categories: Category[],
    period: SelectedPeriod,
    mode: TimelineMode
): CategoryTimeline {
    const isBalance = mode === 'balance';
    const periodTransactions = transactions.filter(
        (t) => (isBalance || t.type === mode) && isInPeriod(t.date, period)
    );

    const series = isBalance
        ? getCategoryBalances(periodTransactions, categories)
        : getCategoryTotals(periodTransactions, categories, mode);

    const knownCategoryIds = new Set(categories.map((c) => c.id));
    const { year, month: selectedMonth } = period;
    const pointCount = selectedMonth === null ? MONTHS_PER_YEAR : getDaysInMonth(year, selectedMonth);

    const amountsPerPoint = Array.from({ length: pointCount }, () => new Map<string, number>());

    periodTransactions.forEach((t) => {
        const index = selectedMonth === null ? getYearAndMonth(t.date).month - 1 : getDayOfMonth(t.date) - 1;
        const categoryId = knownCategoryIds.has(t.categoryId) ? t.categoryId : UNCATEGORIZED.id;
        const amounts = amountsPerPoint[index];
        const signedAmount = isBalance && t.type === 'Ausgabe' ? -t.amount : t.amount;
        amounts.set(categoryId, (amounts.get(categoryId) ?? 0) + signedAmount);
    });

    const runningSums = new Map<string, number>();

    const points: CategoryTimelinePoint[] = amountsPerPoint.map((amounts, index) => {
        const values: Record<string, number> = {};
        series.forEach(({ categoryId }) => {
            const sum = (runningSums.get(categoryId) ?? 0) + (amounts.get(categoryId) ?? 0);
            runningSums.set(categoryId, sum);
            values[categoryId] = roundCents(sum);
        });

        const label = selectedMonth === null ? getShortMonthName(index + 1) : String(index + 1);
        return { label, values };
    });

    return { points, series };
}
