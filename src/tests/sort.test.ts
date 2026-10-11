import { describe, it, expect } from 'vitest';
import { Transaction } from '@/app/interfaces/interfaces';
import { sortTransactions, isSortOption, DEFAULT_SORT_OPTION } from '../utils/sort';


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

const transactions: Transaction[] = [
  makeTransaction({ id: 'a', date: '2026-03-10', amount: 50 }),
  makeTransaction({ id: 'b', date: '2025-12-31', amount: 200 }),
  makeTransaction({ id: 'c', date: '2026-03-02', amount: 5.5 }),
];


const ids = (list: Transaction[]) => list.map((t) => t.id);


describe('sortTransactions', () => {
  it('sorts by date, newest first', () => {
    expect(ids(sortTransactions(transactions, 'date-desc'))).toEqual(['a', 'c', 'b']);
  });

  it('sorts by date, oldest first', () => {
    expect(ids(sortTransactions(transactions, 'date-asc'))).toEqual(['b', 'c', 'a']);
  });

  it('sorts by amount, highest first', () => {
    expect(ids(sortTransactions(transactions, 'amount-desc'))).toEqual(['b', 'a', 'c']);
  });

  it('sorts by amount, lowest first', () => {
    expect(ids(sortTransactions(transactions, 'amount-asc'))).toEqual(['c', 'a', 'b']);
  });

  it('does not change the original array', () => {
    const before = ids(transactions);
    sortTransactions(transactions, 'amount-asc');
    expect(ids(transactions)).toEqual(before);
  });

  it('returns an empty array for an empty list', () => {
    expect(sortTransactions([], 'date-desc')).toEqual([]);
  });
});


describe('isSortOption', () => {
  it.each(['date-desc', 'date-asc', 'amount-desc', 'amount-asc'])('accepts "%s"', (value) => {
    expect(isSortOption(value)).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isSortOption('name-asc')).toBe(false);
  });

  it('uses "newest first" as default', () => {
    expect(DEFAULT_SORT_OPTION).toBe('date-desc');
  });
});
