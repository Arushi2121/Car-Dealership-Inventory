import { formatPrice } from '../format';

describe('formatPrice', () => {
  it('formats cents as whole US dollars with thousands separators', () => {
    expect(formatPrice(2500000)).toBe('$25,000');
  });

  it('drops the cents part', () => {
    expect(formatPrice(2549900)).toBe('$25,499');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });
});
