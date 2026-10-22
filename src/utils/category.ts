import { BudgetUsage, Category, NewCategory, SelectedPeriod, Transaction } from '@/app/interfaces/interfaces';
import { MONTHS_PER_YEAR } from './date-filter';


export const BUDGET_WARNING_RATIO = 0.8;


export const BUDGET_EXCEEDED_RATIO = 1;


export const CATEGORY_NAME_MAX_LENGTH = 30;

export const UNCATEGORIZED: Category = {
    id: 'uncategorized',
    name: 'Ohne Kategorie',
    color: '#888888',
};

export type CategoryErrors = Record<string, string>;

/**
 * Validates a category before it is created or updated.
 * @param category - Category data from the form
 * @param existingCategories - All current categories, used to prevent duplicate names
 * @param ignoreId - Id of the category being edited, so it does not collide with itself
 * @returns One error message per invalid field (empty if valid)
 */
export function checkCategory(
    category: NewCategory,
    existingCategories: Category[],
    ignoreId?: string
): CategoryErrors {
    const errors: CategoryErrors = {};
    const name = category.name.trim();

    if (name === '') {
        errors.name = 'Bitte einen Namen angeben';
    } else if (name.length > CATEGORY_NAME_MAX_LENGTH) {
        errors.name = `Der Name darf höchstens ${CATEGORY_NAME_MAX_LENGTH} Zeichen lang sein`;
    } else {
        const normalized = name.toLocaleLowerCase('de-DE');
        const isDuplicate = existingCategories.some(
            (c) => c.id !== ignoreId && c.name.trim().toLocaleLowerCase('de-DE') === normalized
        );
        if (isDuplicate) {
            errors.name = 'Eine Kategorie mit diesem Namen gibt es bereits';
        }
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(category.color)) {
        errors.color = 'Bitte eine gültige Farbe auswählen';
    }

    if (
        category.monthlyBudget !== undefined &&
        (!Number.isFinite(category.monthlyBudget) || category.monthlyBudget < 0)
    ) {
        errors.monthlyBudget = 'Bitte ein gültiges Budget angeben (0 oder mehr)';
    }

    return errors;
}

/**
 * Converts the budget field text into a number; an empty field means "no budget".
 * @param value - Raw text from the budget input, comma or dot allowed
 * @returns The budget, `undefined` for an empty field or `NaN` for invalid input
 */
export function parseBudgetInput(value: string): number | undefined {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    return Number(trimmed.replace(',', '.'));
}

/**
 * Converts the monthly budget to the selected period: year view = monthly budget × 12.
 * @param monthlyBudget - Budget per month in euro
 * @param period - Selected year and month (`month: null` means the whole year)
 * @returns The limit for the selected period
 */
export function getBudgetLimit(monthlyBudget: number, period: SelectedPeriod): number {
    return period.month === null ? monthlyBudget * MONTHS_PER_YEAR : monthlyBudget;
}

/**
 * Sums up the expenses (not the income) of one category.
 * @param transactions - Transactions of the selected period
 * @param categoryId - Category whose expenses are summed up
 * @returns Total expenses of the category
 */
export function getCategoryExpenses(transactions: Transaction[], categoryId: string): number {
    return transactions
        .filter((t) => t.categoryId === categoryId && t.type === 'Ausgabe')
        .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculates how much of a budget is used and which warning level applies.
 * A budget of 0 € counts as exceeded as soon as anything is spent.
 * @param spent - Expenses in the selected period
 * @param limit - Budget for the selected period
 * @returns Spent amount, limit, rounded percentage (can exceed 100) and status
 */
export function getBudgetUsage(spent: number, limit: number): BudgetUsage {
   
    const ratio = limit > 0 ? spent / limit : spent > 0 ? BUDGET_EXCEEDED_RATIO : 0;

    const status = ratio >= BUDGET_EXCEEDED_RATIO
        ? 'exceeded'
        : ratio >= BUDGET_WARNING_RATIO
            ? 'warning'
            : 'ok';

    return { spent, limit, percent: Math.round(ratio * 100), status };
}
