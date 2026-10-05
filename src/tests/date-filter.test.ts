import { describe, it, expect } from 'vitest';
import { Transaction } from '@/app/interfaces/interfaces';
import {
  getYearAndMonth,
  getAvailableYears,
  getMonthName,
  getMonthOptions,
  isInPeriod,
  filterTransactions,
  MONTHS_PER_YEAR,
} from '../utils/date-filter';


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


describe('getYearAndMonth', () => {

  it('reads year and month from an ISO date string', () => {
    expect(getYearAndMonth('2026-05-17')).toEqual({ year: 2026, month: 5 });
  });

  it('returns the month without leading zero as a number', () => {
    expect(getYearAndMonth('2026-05-01').month).toBe(5);
  });



  it('returns January for the first day of the year', () => {
    expect(getYearAndMonth('2026-01-01')).toEqual({ year: 2026, month: 1 });
  });
});


describe('getAvailableYears', () => {

  it('returns each year only once, even with several bookings per year', () => {
    const transactions = [makeTransaction({ date: '2025-01-01' }), makeTransaction({ date: '2025-01-01' })];
    expect(getAvailableYears(transactions, 2026)).toEqual([2026, 2025]);
  });


  it('sorts the years descending (newest first)', () => {
    const transactions = [
      makeTransaction({ date: '2024-03-01' }),
      makeTransaction({ date: '2026-03-01' }),
      makeTransaction({ date: '2025-03-01' }),
    ];
    expect(getAvailableYears(transactions, 2024)).toEqual([2026, 2025, 2024]);
  });


  it('always contains the current year, even without bookings in it', () => {
    expect(getAvailableYears([], 2026)).toEqual([2026]);
  });

  it('does not mutate the passed transactions array', () => {
    const transactions = [
      makeTransaction({ date: '2024-03-01' }),
      makeTransaction({ date: '2026-03-01' }),
      makeTransaction({ date: '2025-03-01' }),
    ];
    const snapshot = structuredClone(transactions);

    getAvailableYears(transactions, 2026);

    expect(transactions).toEqual(snapshot);
  });
});


describe('getMonthName', () => {

  it('returns "Januar" for month 1', () => {
    expect(getMonthName(1)).toEqual("Januar")
  });

  it('returns "Dezember" for month 12', () => {
    expect(getMonthName(12)).toEqual("Dezember")
  });


  it('returns "März" (with umlaut) for month 3', () => {
    expect(getMonthName(3)).toEqual("März")
  });

  it.each([
    [1, 'Januar'],
    [2, 'Februar'],
    [3, 'März'],
    [4, 'April'],
    [5, 'Mai'],
    [6, 'Juni'],
    [7, 'Juli'],
    [8, 'August'],
    [9, 'September'],
    [10, 'Oktober'],
    [11, 'November'],
    [12, 'Dezember'],
  ])('returns the correct name for month %i', (monthNumber, expected) => {
    expect(getMonthName(monthNumber)).toBe(expected);
  });


  it('rolls over out-of-range months instead of throwing', () => {
    expect(getMonthName(0)).toBe('Dezember');
    expect(getMonthName(13)).toBe('Januar');
    expect(getMonthName(-1)).toBe('November');
  });
});


describe('getMonthOptions', () => {

  it('returns exactly MONTHS_PER_YEAR options', () => {
    expect(getMonthOptions()).toHaveLength(12)
  });


  it('starts with value 1 and ends with value 12', () => {
    const options = getMonthOptions();
    expect(options[0].value).toBe(1);
    expect(options.at(-1)?.value).toBe(12);
  });

  it('uses the German month name as label', () => {
    const options = getMonthOptions();
    expect(options[0].label).toBe('Januar');
    expect(options[2].label).toBe('März');
    expect(options[11].label).toBe('Dezember');
  });
});


describe('isInPeriod', () => {

  it('returns true for a date inside the selected month', () => {
    expect(isInPeriod('2026-05-10', { year: 2026, month: 5 })).toBe(true);
  });


  it('returns false for a date in another month of the same year', () => {
    expect(isInPeriod('2026-05-10', { year: 2026, month: 6 })).toBe(false);
  });

  it('returns false for the same month in another year', () => {
    expect(isInPeriod('2026-05-10', { year: 2025, month: 5 })).toBe(false);
  });


  it('returns true for every month of the year when month is null', () => {
    expect(isInPeriod('2026-05-10', { year: 2026, month: null })).toBe(true);
  });


  it('includes the first and the last day of the month', () => {
    expect(isInPeriod('2026-05-01', { year: 2026, month: 5 })).toBe(true);
    expect(isInPeriod('2026-05-31', { year: 2026, month: 5 })).toBe(true);
  });
});


describe('filterTransactions', () => {

  const transactions: Transaction[] = [
    makeTransaction({ id: 'a', date: '2026-05-01', categoryId: '1' }),
    makeTransaction({ id: 'b', date: '2026-05-20', categoryId: '2' }),
    makeTransaction({ id: 'c', date: '2026-06-01', categoryId: '1' }),
    makeTransaction({ id: 'd', date: '2025-05-01', categoryId: '1' }),
  ];

  it('returns only bookings of the selected month when category is "all"', () => {
    const result = filterTransactions(transactions, { year: 2026, month: 5 }, 'all');
    expect(result.map((t) => t.id)).toEqual([
      "a",
      "b",
    ]);
  });


  it('returns the whole year when month is null', () => {
    const result = filterTransactions(transactions, { year: 2026, month: null }, 'all');
    expect(result).toHaveLength(3)
  });

  it('combines time filter and category filter', () => {
    const result = filterTransactions(transactions, { year: 2026, month: 5 }, '2');
    expect(result[0].id).toBe('b')
  });

  it('returns an empty array when nothing matches', () => {
    const result = filterTransactions(transactions, { year: 2024, month: null }, 'all');
    expect(result).toStrictEqual([])
  });


  it('handles an empty transactions list', () => {
    const result = filterTransactions([], { year: 2024, month: null }, 'all');
    expect(result).toStrictEqual([])
  });
});


