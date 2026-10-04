import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils/currency';


const normalize = (value: string) => value.replace(/ /g, ' ');

describe('formatCurrency', () => {

  it('formats a whole number with two decimals and euro sign', () => {
    expect(normalize(formatCurrency(12))).toBe('12,00 €');
  });

  it('uses a comma as decimal separator', () => {
    expect(normalize(formatCurrency(12.5))).toBe('12,50 €');
  });

  it('uses a dot as thousands separator', () => {
    expect(normalize(formatCurrency(1234.56))).toBe('1.234,56 €');
  });

  it('rounds to two decimals', () => {
    expect(normalize(formatCurrency(0.999))).toBe('1,00 €');
  });

  it('formats negative values with a minus sign', () => {
    expect(normalize(formatCurrency(-5))).toBe('-5,00 €');
  });
});
