import type { Category, Vehicle } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { median, rateDeals } from '../dealRating.js';

function car(id: string, category: Category, price: number): Vehicle {
  const now = new Date(0);
  return {
    id,
    make: 'Test',
    model: id,
    category,
    price,
    quantity: 1,
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  };
}

describe('median', () => {
  it('picks the middle value when the count is odd', () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it('averages the two middle values when the count is even', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});

describe('rateDeals', () => {
  // Each threshold is its own category, so the car under test is inside the median of 200.
  it('rates a price at exactly 90% of the median as GREAT', () => {
    const cars = [car('low', 'SEDAN', 180), car('mid', 'SEDAN', 200), car('high', 'SEDAN', 300)];

    expect(rateDeals(cars)).toContainEqual({
      vehicleId: 'low',
      rating: 'GREAT',
      categoryMedian: 200,
      differencePercent: -10,
    });
  });

  it('rates a price at exactly 110% of the median as ABOVE_MARKET', () => {
    const cars = [car('low', 'SEDAN', 100), car('mid', 'SEDAN', 200), car('high', 'SEDAN', 220)];

    expect(rateDeals(cars)).toContainEqual({
      vehicleId: 'high',
      rating: 'ABOVE_MARKET',
      categoryMedian: 200,
      differencePercent: 10,
    });
  });

  it('rates a price equal to the median as FAIR', () => {
    const cars = [car('low', 'SEDAN', 100), car('mid', 'SEDAN', 200), car('high', 'SEDAN', 300)];

    expect(rateDeals(cars)).toContainEqual({
      vehicleId: 'mid',
      rating: 'FAIR',
      categoryMedian: 200,
      differencePercent: 0,
    });
  });

  it('counts a vehicle in its own category median', () => {
    // Without this car the other two average 250, and 200 would be 80% of that (GREAT).
    const cars = [car('low', 'PICKUP', 100), car('mid', 'PICKUP', 200), car('high', 'PICKUP', 400)];

    expect(rateDeals(cars)).toContainEqual({
      vehicleId: 'mid',
      rating: 'FAIR',
      categoryMedian: 200,
      differencePercent: 0,
    });
  });

  it('rounds a difference of 6.5 percent away from zero', () => {
    const above = [car('low', 'SEDAN', 100), car('mid', 'SEDAN', 200), car('high', 'SEDAN', 213)];
    const below = [car('low', 'SEDAN', 187), car('mid', 'SEDAN', 200), car('high', 'SEDAN', 300)];

    expect(rateDeals(above)).toContainEqual({
      vehicleId: 'high',
      rating: 'FAIR',
      categoryMedian: 200,
      differencePercent: 7,
    });
    expect(rateDeals(below)).toContainEqual({
      vehicleId: 'low',
      rating: 'FAIR',
      categoryMedian: 200,
      differencePercent: -7,
    });
  });

  it('rounds the category median to the nearest cent', () => {
    // The two middle prices are 200 and 301, so the median is 250.5 cents.
    const cars = [
      car('a', 'HATCHBACK', 100),
      car('b', 'HATCHBACK', 200),
      car('c', 'HATCHBACK', 301),
      car('d', 'HATCHBACK', 400),
    ];

    expect(rateDeals(cars).map((result) => result.categoryMedian)).toEqual([251, 251, 251, 251]);
  });

  it('rates each category from its own median', () => {
    const cars = [
      car('sedan-low', 'SEDAN', 100),
      car('sedan-mid', 'SEDAN', 200),
      car('sedan-high', 'SEDAN', 300),
      car('suv-a', 'SUV', 300),
      car('suv-b', 'SUV', 300),
      car('suv-c', 'SUV', 300),
    ];

    const results = rateDeals(cars);

    expect(results).toHaveLength(cars.length);
    // 300 is 50% over the sedan median, and exactly the SUV median.
    expect(results).toContainEqual({
      vehicleId: 'sedan-high',
      rating: 'ABOVE_MARKET',
      categoryMedian: 200,
      differencePercent: 50,
    });
    expect(results).toContainEqual({
      vehicleId: 'suv-a',
      rating: 'FAIR',
      categoryMedian: 300,
      differencePercent: 0,
    });
  });

  it('returns nulls when a category has fewer than 3 vehicles', () => {
    const cars = [car('a', 'COUPE', 100), car('b', 'COUPE', 500)];

    expect(rateDeals(cars)).toEqual(
      expect.arrayContaining([
        { vehicleId: 'a', rating: null, categoryMedian: null, differencePercent: null },
        { vehicleId: 'b', rating: null, categoryMedian: null, differencePercent: null },
      ]),
    );
    expect(rateDeals(cars)).toHaveLength(2);
  });

  it('returns an empty list when there are no vehicles', () => {
    expect(rateDeals([])).toEqual([]);
  });
});
