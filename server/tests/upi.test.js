import { describe, it, expect } from 'vitest';
import { parseUpi } from '../src/services/upi.js';

describe('parseUpi', () => {
  it('reads payee, amount and note', () => {
    const p = parseUpi('upi://pay?pa=chai@okbank&pn=Chai%20Point&am=50.00&cu=INR&tn=Tea');
    expect(p).toMatchObject({ upiId: 'chai@okbank', payeeName: 'Chai Point', amount: 50, note: 'Tea' });
  });
  it('accepts a code with no amount', () => {
    expect(parseUpi('upi://pay?pa=shop@ybl&pn=Shop').amount).toBeNull();
  });
  it('rejects non-UPI and foreign-currency codes', () => {
    expect(parseUpi('https://example.com')).toBeNull();
    expect(parseUpi('upi://pay?pa=a@b&cu=USD')).toBeNull();
    expect(parseUpi('upi://pay?pn=NoAddress')).toBeNull();
  });
});
