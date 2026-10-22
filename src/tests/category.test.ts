import { describe, it, expect } from 'vitest';
import { Category, NewCategory, Transaction } from '@/app/interfaces/interfaces';
import {
  checkCategory,
  parseBudgetInput,
  getBudgetLimit,
  getBudgetUsage,
  getCategoryExpenses,
  CATEGORY_NAME_MAX_LENGTH,
} from '../utils/category';


/**
 * Small factory so each test only has to set the fields it actually cares about.
 * @param overrides - Fields that replace the default values
 * @returns A complete transaction
 */
function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'test-id',
    type: 'Ausgabe',
    amount: 10,
    categoryId: '1',
    date: '2026-01-01',
    isRecurring: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Builds valid category form data; tests overwrite single fields to make it invalid.
 * @param overrides - Fields that replace the default values
 * @returns Category data without id
 */
function makeNewCategory(overrides: Partial<NewCategory>): NewCategory {
  return { name: 'Haustier', color: '#3d6b8a', ...overrides };
}

const existing: Category[] = [{ id: '1', name: 'Wohnen', color: '#185FA5' }];


describe('checkCategory', () => {
  it('returns no errors for valid data', () => {
    expect(checkCategory(makeNewCategory({}), existing)).toEqual({});
  });

  it.each(['', '   '])('requires a name (input "%s")', (name) => {
    expect(checkCategory(makeNewCategory({ name }), existing)).toHaveProperty('name');
  });

  it('rejects names that are too long', () => {
    const name = 'x'.repeat(CATEGORY_NAME_MAX_LENGTH + 1);
    expect(checkCategory(makeNewCategory({ name }), existing)).toHaveProperty('name');
  });

  it.each(['Wohnen', 'wohnen', '  WOHNEN '])('prevents duplicate names regardless of case and spaces ("%s")', (name) => {
    expect(checkCategory(makeNewCategory({ name }), existing)).toHaveProperty('name');
  });

  it('allows keeping the own name while editing', () => {
    expect(checkCategory(makeNewCategory({ name: 'Wohnen' }), existing, '1')).toEqual({});
  });

  it.each(['red', '#fff', '#12345g'])('rejects invalid colors ("%s")', (color) => {
    expect(checkCategory(makeNewCategory({ color }), existing)).toHaveProperty('color');
  });

  it.each([-1, Number.NaN])('rejects invalid budgets (%s)', (monthlyBudget) => {
    expect(checkCategory(makeNewCategory({ monthlyBudget }), existing)).toHaveProperty('monthlyBudget');
  });

  it.each([0, 250.5, undefined])('accepts budget %s', (monthlyBudget) => {
    expect(checkCategory(makeNewCategory({ monthlyBudget }), existing)).toEqual({});
  });
});


describe('parseBudgetInput', () => {
  it.each([
    { input: '', expected: undefined },
    { input: '   ', expected: undefined },
    { input: '300', expected: 300 },
    { input: '12,5', expected: 12.5 },
    { input: '12.5', expected: 12.5 },
  ])('turns "$input" into $expected', ({ input, expected }) => {
    expect(parseBudgetInput(input)).toBe(expected);
  });

  it('returns NaN for text that is no number', () => {
    expect(parseBudgetInput('abc')).toBeNaN();
  });
});


describe('getBudgetLimit', () => {
  it('uses the monthly budget in the month view', () => {
    expect(getBudgetLimit(300, { year: 2026, month: 5 })).toBe(300);
  });

  it('multiplies by 12 in the year view', () => {
    expect(getBudgetLimit(300, { year: 2026, month: null })).toBe(3600);
  });
});


describe('getCategoryExpenses', () => {
  it('sums only expenses of the given category', () => {
    const list = [
      makeTransaction({ categoryId: '1', amount: 20 }),
      makeTransaction({ categoryId: '1', amount: 5.5 }),
      makeTransaction({ categoryId: '1', amount: 100, type: 'Einnahme' }),
      makeTransaction({ categoryId: '2', amount: 70 }),
    ];
    expect(getCategoryExpenses(list, '1')).toBe(25.5);
  });
});


describe('getBudgetUsage', () => {
  it.each([
    { spent: 0, limit: 100, percent: 0, status: 'ok' },
    { spent: 79, limit: 100, percent: 79, status: 'ok' },
    { spent: 80, limit: 100, percent: 80, status: 'warning' },
    { spent: 99.9, limit: 100, percent: 100, status: 'warning' },
    { spent: 100, limit: 100, percent: 100, status: 'exceeded' },
    { spent: 150, limit: 100, percent: 150, status: 'exceeded' },
  ])('$spent of $limit → $percent % ($status)', ({ spent, limit, percent, status }) => {
    expect(getBudgetUsage(spent, limit)).toEqual({ spent, limit, percent, status });
  });

  it('treats a 0 € budget without expenses as ok', () => {
    expect(getBudgetUsage(0, 0)).toMatchObject({ percent: 0, status: 'ok' });
  });

  it('treats a 0 € budget with expenses as exceeded without dividing by 0', () => {
    expect(getBudgetUsage(10, 0)).toMatchObject({ percent: 100, status: 'exceeded' });
  });
});
