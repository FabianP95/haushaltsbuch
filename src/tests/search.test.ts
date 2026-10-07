import { describe, it, expect } from 'vitest';
import { Transaction } from '@/app/interfaces/interfaces';
import { matchesSearch } from '../utils/search';


/*
 * TEST MASK for matchesSearch – write the tests yourself.
 *
 * How to use this file:
 * - `it.todo('...')` registers a planned test WITHOUT a body. Vitest lists it as "todo"
 *   instead of failing, so the suite stays green while you work through the list.
 *   To implement one, change `it.todo('name')` to `it('name', () => { ... })`.
 * - matchesSearch returns a boolean → `expect(...).toBe(true)` / `.toBe(false)`.
 * - Tip: Copy the `makeTransaction` factory from date-filter.test.ts, then set only
 *   the fields that matter for the test (`amount`, `description`).
 *
 * New, optional method:
 * - `it.each([...])('name %s', (input, expected) => { ... })` runs the same test
 *   with several inputs. Handy when you check many search terms against one transaction.
 *   Docs: https://vitest.dev/api/#test-each
 */


// TODO: makeTransaction factory (see date-filter.test.ts)
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

describe('matchesSearch – empty search', () => {

  it('returns true for an empty string', () => {
    expect(matchesSearch(makeTransaction({ amount: 200 }), "")).toBe(true)
  });


  it('returns true for a search term that only contains spaces', () => {
    expect(matchesSearch(makeTransaction({ amount: 200 }), "   ")).toBe(true)
  });
});


describe('matchesSearch – text search (description)', () => {


  it.each([
    { query: "haus", expected: true },
    { query: "HAUS", expected: true },
    { query: "hauS", expected: true },
    { query: "ohn", expected: true },
    { query: "boot", expected: false },
    { query: "  ohn  ", expected: true },
  ])('testing for full description, upper/lower case, partial, doesnt contain, leading/trailing spaces', ({ query, expected }) => {
    expect(matchesSearch(makeTransaction({ description: 'haus und wohnung' }), query)).toBe(expected)
  })



  it('does not crash for a transaction without description', () => {
    expect(matchesSearch(makeTransaction({ amount: 200 }), " haus  ")).toBe(false)
  });


});


describe('matchesSearch – amount search', () => {

  it.each(["12.5", "12.50", "12,5", "12,50"])('accepts comma and dot as decimal separator', (query) => {
    expect(matchesSearch(makeTransaction({ amount: 12.5 }), query)).toBe(true)
  });


  it('finds amounts that start with the digits', () => {
    expect(matchesSearch(makeTransaction({ amount: 12.99 }), " 12  ")).toBe(true)
  });

  it.each([120, 21.12, 3012])('finds the digits anywhere inside the amount', (query) => {
    expect(matchesSearch(makeTransaction({ amount: query }), " 12  ")).toBe(true)
  });


  it('returns false if the amount does not contain the digits', () => {
    expect(matchesSearch(makeTransaction({ amount: 45 }), " 12  ")).toBe(false)
  });


  it('respects the position of the decimals', () => {
    expect(matchesSearch(makeTransaction({ amount: 12.05 }), "12,5")).toBe(false)
  });

  it('finds an amount with two decimals, e.g. "12,50"', () => {
    expect(matchesSearch(makeTransaction({ amount: 12.50 }), "12,50")).toBe(true)
  });
});


describe('matchesSearch – mixed cases', () => {

  it('finds numbers inside the description, too', () => {
    expect(matchesSearch(makeTransaction({ amount: 50, description: "Tankfüllung 2026" }), "2026")).toBe(true)
  });

  it('returns false for text that matches neither description nor amount', () => {
    expect(matchesSearch(makeTransaction({ amount: 50, description: "dfe" }), "abc")).toBe(false)
  });
});

