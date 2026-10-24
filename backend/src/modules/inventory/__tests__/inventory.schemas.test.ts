import { describe, expect, it } from 'vitest';
import { purchaseSchema, restockSchema } from '../inventory.schemas.js';

describe('purchaseSchema', () => {
  // Express 5 leaves req.body undefined when the request has no body.
  it.each([
    ['no body', undefined],
    ['an empty object', {}],
  ])('defaults quantity to 1 for %s', (_case, body) => {
    const result = purchaseSchema.safeParse(body);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ quantity: 1 });
  });

  it('accepts a positive integer quantity', () => {
    const result = purchaseSchema.safeParse({ quantity: 3 });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ quantity: 3 });
  });

  it.each([0, -1, 1.5, '2'])('rejects quantity %j', (quantity) => {
    expect(purchaseSchema.safeParse({ quantity }).success).toBe(false);
  });
});

describe('restockSchema', () => {
  it('rejects a body without quantity', () => {
    expect(restockSchema.safeParse({}).success).toBe(false);
  });

  it.each([0, 1.5, 10001])('rejects quantity %s', (quantity) => {
    expect(restockSchema.safeParse({ quantity }).success).toBe(false);
  });

  it.each([1, 10000])('accepts quantity %s', (quantity) => {
    const result = restockSchema.safeParse({ quantity });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ quantity });
  });
});
