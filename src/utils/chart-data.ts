import { Category, CategoryTotal, MoneyFlowData, MoneyFlowNode, MonthlyTotal, Transaction, TransactionType } from '@/app/interfaces/interfaces';
import { MONTHS_PER_YEAR, getShortMonthName, getYearAndMonth } from './date-filter';
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
