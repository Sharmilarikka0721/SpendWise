import { describe, it, expect } from 'vitest';
import { inr, inrShort, shiftMonth, percentChange } from './format.js';

describe('format helpers', () => {
  it('formats rupees the Indian way', () => {
    expect(inr(1234567)).toBe('₹12,34,567');
    expect(inrShort(2500)).toBe('₹2.5k');
  });
  it('shifts months across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });
  it('computes percent change safely', () => {
    expect(percentChange(85, 100)).toBe(-15);
    expect(percentChange(50, 0)).toBeNull();
  });
});
