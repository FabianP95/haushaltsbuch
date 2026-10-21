import { describe, it, expect } from 'vitest';
import { Category, MoneyFlowData, Transaction } from '@/app/interfaces/interfaces';
import {
  BUDGET_NODE_NAME,
  DEFICIT_NODE_NAME,
  SURPLUS_NODE_NAME,
  formatPercent,
  getCategoryBalances,
  getCategoryTimeline,
  getCategoryTotals,
  getMoneyFlow,
  getMonthlyTotals,
  roundCents,
} from '../utils/chart-data';
import { UNCATEGORIZED } from '../utils/category';


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
    categoryId: 'food',
    date: '2026-01-01',
    isRecurring: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const categories: Category[] = [
  { id: 'food', name: 'Lebensmittel', icon: '🛒', color: '#3B6D11' },
  { id: 'home', name: 'Wohnen', icon: '🏠', color: '#185FA5' },
  { id: 'salary', name: 'Gehalt', icon: '💶', color: '#04342C' },
];

/**
 * Sums all link values that end in (or start at) the budget node.
 * @param flow - Money flow data to check
 * @returns Incoming and outgoing sum of the budget node
 */
function getBudgetFlows(flow: MoneyFlowData) {
  const budgetIndex = flow.nodes.findIndex((n) => n.name === BUDGET_NODE_NAME);
  const incoming = flow.links.filter((l) => l.target === budgetIndex).reduce((sum, l) => sum + l.value, 0);
  const outgoing = flow.links.filter((l) => l.source === budgetIndex).reduce((sum, l) => sum + l.value, 0);
  return { incoming, outgoing };
}

const nodeNames = (flow: MoneyFlowData) => flow.nodes.map((n) => n.name);


describe('roundCents', () => {
  it('removes floating point leftovers', () => {
    expect(roundCents(0.1 + 0.2)).toBe(0.3);
  });
});


describe('formatPercent', () => {
  it('formats a ratio as German percent with one decimal', () => {
    expect(formatPercent(0.256).replace(/\s/g, ' ')).toBe('25,6 %');
  });
});


describe('getMonthlyTotals', () => {
  it('always returns 12 months, empty months with 0', () => {
    const result = getMonthlyTotals([], 2026);
    expect(result).toHaveLength(12);
    expect(result.every((m) => m.income === 0 && m.expense === 0)).toBe(true);
  });

  it('sums income and expenses per month', () => {
    const result = getMonthlyTotals([
      makeTransaction({ date: '2026-03-01', type: 'Einnahme', amount: 100 }),
      makeTransaction({ date: '2026-03-15', type: 'Ausgabe', amount: 20 }),
      makeTransaction({ date: '2026-03-31', type: 'Ausgabe', amount: 5.5 }),
    ], 2026);
    expect(result[2]).toMatchObject({ month: 3, income: 100, expense: 25.5 });
  });

  it('ignores transactions of other years', () => {
    const result = getMonthlyTotals([makeTransaction({ date: '2025-03-01', amount: 99 })], 2026);
    expect(result[2].expense).toBe(0);
  });

  it('uses German month labels', () => {
    expect(getMonthlyTotals([], 2026)[2].label).toMatch(/^Mär/);
  });
});


describe('getCategoryTotals', () => {
  const transactions = [
    makeTransaction({ categoryId: 'food', amount: 30 }),
    makeTransaction({ categoryId: 'food', amount: 10 }),
    makeTransaction({ categoryId: 'home', amount: 60 }),
    makeTransaction({ categoryId: 'salary', type: 'Einnahme', amount: 1000 }),
  ];

  it('sums only the given type, biggest amount first', () => {
    const result = getCategoryTotals(transactions, categories, 'Ausgabe');
    expect(result.map((r) => [r.categoryId, r.amount])).toEqual([['home', 60], ['food', 40]]);
  });

  it('calculates shares that add up to 100 %', () => {
    const result = getCategoryTotals(transactions, categories, 'Ausgabe');
    expect(result.map((r) => r.ratio)).toEqual([0.6, 0.4]);
  });

  it('collects unknown categories in "Ohne Kategorie"', () => {
    const result = getCategoryTotals([makeTransaction({ categoryId: 'deleted' })], categories, 'Ausgabe');
    expect(result[0]).toMatchObject({ categoryId: UNCATEGORIZED.id, name: UNCATEGORIZED.name });
  });

  it('returns an empty list without matching transactions', () => {
    expect(getCategoryTotals([], categories, 'Ausgabe')).toEqual([]);
  });
});


describe('getMoneyFlow', () => {
  it('returns no nodes without transactions', () => {
    expect(getMoneyFlow([], categories)).toEqual({ nodes: [], links: [] });
  });

  it('adds a surplus node when income is higher than expenses', () => {
    const flow = getMoneyFlow([
      makeTransaction({ categoryId: 'salary', type: 'Einnahme', amount: 1000 }),
      makeTransaction({ categoryId: 'home', amount: 600 }),
    ], categories);

    expect(nodeNames(flow)).toEqual([BUDGET_NODE_NAME, 'Gehalt', 'Wohnen', SURPLUS_NODE_NAME]);
    expect(flow.links.at(-1)?.value).toBe(400);
  });

  it('adds a deficit node when expenses are higher than income', () => {
    const flow = getMoneyFlow([
      makeTransaction({ categoryId: 'salary', type: 'Einnahme', amount: 100 }),
      makeTransaction({ categoryId: 'home', amount: 150 }),
    ], categories);

    expect(nodeNames(flow)).toContain(DEFICIT_NODE_NAME);
    expect(nodeNames(flow)).not.toContain(SURPLUS_NODE_NAME);
  });

  it('works without any income (everything is deficit)', () => {
    const flow = getMoneyFlow([makeTransaction({ categoryId: 'home', amount: 50 })], categories);
    expect(nodeNames(flow)).toEqual([BUDGET_NODE_NAME, DEFICIT_NODE_NAME, 'Wohnen']);
  });

  it('adds no extra node and no zero link when income equals expenses', () => {
    const flow = getMoneyFlow([
      makeTransaction({ categoryId: 'salary', type: 'Einnahme', amount: 0.3 }),
      makeTransaction({ categoryId: 'food', amount: 0.1 }),
      makeTransaction({ categoryId: 'home', amount: 0.2 }),
    ], categories);

    expect(nodeNames(flow)).not.toContain(SURPLUS_NODE_NAME);
    expect(nodeNames(flow)).not.toContain(DEFICIT_NODE_NAME);
    expect(flow.links.every((l) => l.value > 0)).toBe(true);
  });

  it('keeps incoming and outgoing sums of the budget node equal', () => {
    const flow = getMoneyFlow([
      makeTransaction({ categoryId: 'salary', type: 'Einnahme', amount: 500 }),
      makeTransaction({ categoryId: 'food', amount: 320.4 }),
      makeTransaction({ categoryId: 'home', amount: 410 }),
    ], categories);

    const { incoming, outgoing } = getBudgetFlows(flow);
    expect(roundCents(incoming)).toBe(roundCents(outgoing));
  });
});


describe('getCategoryTimeline', () => {
  it('builds one point per day for a month, February 2028 has 29', () => {
    const { points } = getCategoryTimeline([], categories, { year: 2028, month: 2 }, 'Ausgabe');
    expect(points).toHaveLength(29);
    expect(points[0].label).toBe('1');
    expect(points[28].label).toBe('29');
  });

  it('builds 12 points for a whole year', () => {
    const { points } = getCategoryTimeline([], categories, { year: 2026, month: null }, 'Ausgabe');
    expect(points).toHaveLength(12);
  });

  it('sums the amounts cumulatively per day', () => {
    const { points } = getCategoryTimeline([
      makeTransaction({ categoryId: 'food', amount: 10, date: '2026-03-02' }),
      makeTransaction({ categoryId: 'food', amount: 0.1, date: '2026-03-02' }),
      makeTransaction({ categoryId: 'food', amount: 0.2, date: '2026-03-05' }),
    ], categories, { year: 2026, month: 3 }, 'Ausgabe');

    expect(points[0].values.food).toBe(0);
    expect(points[1].values.food).toBe(10.1);
    expect(points[4].values.food).toBe(10.3);
    expect(points[30].values.food).toBe(10.3);
  });

  it('sums the amounts cumulatively per month for a whole year', () => {
    const { points } = getCategoryTimeline([
      makeTransaction({ categoryId: 'home', amount: 500, date: '2026-01-01' }),
      makeTransaction({ categoryId: 'home', amount: 500, date: '2026-03-01' }),
    ], categories, { year: 2026, month: null }, 'Ausgabe');

    expect(points.map((p) => p.values.home)).toEqual([500, 500, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
  });

  it('ignores other types and bookings outside the period', () => {
    const { series } = getCategoryTimeline([
      makeTransaction({ categoryId: 'food', date: '2026-03-02' }),
      makeTransaction({ categoryId: 'salary', type: 'Einnahme', date: '2026-03-02' }),
      makeTransaction({ categoryId: 'home', date: '2026-04-02' }),
    ], categories, { year: 2026, month: 3 }, 'Ausgabe');

    expect(series.map((s) => s.categoryId)).toEqual(['food']);
  });

  it('collects unknown categories in "Ohne Kategorie"', () => {
    const { points, series } = getCategoryTimeline([
      makeTransaction({ categoryId: 'deleted', amount: 25, date: '2026-03-02' }),
    ], categories, { year: 2026, month: 3 }, 'Ausgabe');

    expect(series[0].categoryId).toBe(UNCATEGORIZED.id);
    expect(points[1].values[UNCATEGORIZED.id]).toBe(25);
  });
});


describe('getCategoryBalances', () => {
  it('subtracts expenses from income per category, highest balance first', () => {
    const balances = getCategoryBalances([
      makeTransaction({ categoryId: 'home', type: 'Einnahme', amount: 100 }),
      makeTransaction({ categoryId: 'home', amount: 40.3 }),
      makeTransaction({ categoryId: 'food', amount: 20 }),
    ], categories);

    expect(balances.map((b) => [b.categoryId, b.amount])).toEqual([['home', 59.7], ['food', -20]]);
  });

  it('keeps categories whose income and expenses cancel out', () => {
    const balances = getCategoryBalances([
      makeTransaction({ categoryId: 'food', type: 'Einnahme', amount: 15 }),
      makeTransaction({ categoryId: 'food', amount: 15 }),
    ], categories);

    expect(balances).toHaveLength(1);
    expect(balances[0].amount).toBe(0);
    expect(balances[0].ratio).toBe(0);
  });
});


describe('getCategoryTimeline in balance mode', () => {
  it('lets income raise and expenses lower the running sum', () => {
    const { points, series } = getCategoryTimeline([
      makeTransaction({ categoryId: 'food', amount: 30, date: '2026-03-02' }),
      makeTransaction({ categoryId: 'food', type: 'Einnahme', amount: 50, date: '2026-03-04' }),
    ], categories, { year: 2026, month: 3 }, 'balance');

    expect(series.map((s) => s.categoryId)).toEqual(['food']);
    expect(points[1].values.food).toBe(-30);
    expect(points[3].values.food).toBe(20);
  });
});
