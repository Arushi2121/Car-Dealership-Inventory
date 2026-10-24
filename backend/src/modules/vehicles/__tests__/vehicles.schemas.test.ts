import { describe, expect, it } from 'vitest';
import type { ZodSafeParseResult } from 'zod';
import {
  createVehicleSchema,
  searchVehicleSchema,
  updateVehicleSchema,
} from '../vehicles.schemas.js';

// The largest value a Postgres Int column holds.
const MAX_INT = 2147483647;

const validVehicle = {
  make: 'Toyota',
  model: 'Corolla',
  category: 'SEDAN',
  price: 2500000,
  quantity: 5,
};

function messagesOf(result: ZodSafeParseResult<unknown>): string {
  return result.error?.issues.map((issue) => issue.message).join(' ') ?? '';
}

describe('createVehicleSchema', () => {
  it('accepts a valid body and trims make and model', () => {
    const result = createVehicleSchema.safeParse({
      ...validVehicle,
      make: '  Toyota ',
      model: ' Corolla  ',
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({ make: 'Toyota', model: 'Corolla' });
  });

  it('accepts the edge values: price 1 and the Int limit, quantity 0 and the Int limit', () => {
    expect(createVehicleSchema.safeParse({ ...validVehicle, price: 1, quantity: 0 }).success).toBe(
      true,
    );
    expect(
      createVehicleSchema.safeParse({ ...validVehicle, price: MAX_INT, quantity: MAX_INT }).success,
    ).toBe(true);
  });

  it.each(['make', 'model', 'category', 'price', 'quantity'])(
    'rejects a body missing %s',
    (field) => {
      const body: Record<string, unknown> = { ...validVehicle };
      delete body[field];

      expect(createVehicleSchema.safeParse(body).success).toBe(false);
    },
  );

  it.each([0, -100, 10.5, MAX_INT + 1])('rejects price %s', (price) => {
    expect(createVehicleSchema.safeParse({ ...validVehicle, price }).success).toBe(false);
  });

  it.each([-1, 1.5])('rejects quantity %s', (quantity) => {
    expect(createVehicleSchema.safeParse({ ...validVehicle, quantity }).success).toBe(false);
  });

  it('rejects a category outside the enum', () => {
    expect(createVehicleSchema.safeParse({ ...validVehicle, category: 'BOAT' }).success).toBe(
      false,
    );
  });
});

describe('updateVehicleSchema', () => {
  it('accepts a partial body', () => {
    const result = updateVehicleSchema.safeParse({ price: 1999900 });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ price: 1999900 });
  });

  it('rejects an empty body, saying at least one field is required', () => {
    const result = updateVehicleSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(messagesOf(result)).toMatch(/at least one field/i);
  });

  it('rejects quantity, saying stock changes only through purchase or restock', () => {
    const result = updateVehicleSchema.safeParse({ price: 1999900, quantity: 10 });

    expect(result.success).toBe(false);
    expect(messagesOf(result)).toMatch(/purchase or restock/i);
  });
});

describe('searchVehicleSchema', () => {
  it('coerces minPrice and maxPrice from query strings to numbers', () => {
    const result = searchVehicleSchema.safeParse({ minPrice: '100', maxPrice: '500' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ minPrice: 100, maxPrice: 500 });
  });

  it('uppercases the category', () => {
    const result = searchVehicleSchema.safeParse({ category: 'suv' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ category: 'SUV' });
  });

  it('treats empty strings as not provided', () => {
    // An empty search form submits every field as "".
    const result = searchVehicleSchema.safeParse({
      make: '',
      model: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({});
  });

  it('rejects minPrice greater than maxPrice', () => {
    expect(searchVehicleSchema.safeParse({ minPrice: '500', maxPrice: '100' }).success).toBe(false);
  });

  it('rejects a non-numeric minPrice', () => {
    expect(searchVehicleSchema.safeParse({ minPrice: 'abc' }).success).toBe(false);
  });
});
