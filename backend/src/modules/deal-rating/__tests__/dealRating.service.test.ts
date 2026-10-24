import type { Vehicle } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import type { VehicleRepository } from '../../vehicles/index.js';
import { DealRatingService } from '../dealRating.service.js';

function suv(id: string, price: number): Vehicle {
  const now = new Date(0);
  return {
    id,
    make: 'Volvo',
    model: id,
    category: 'SUV',
    price,
    quantity: 2,
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Stand-in for the catalogue read. Deal rating never writes vehicles. */
class FakeVehicleReader implements Pick<VehicleRepository, 'findMany'> {
  constructor(private readonly vehicles: Vehicle[]) {}

  async findMany() {
    return this.vehicles;
  }
}

describe('DealRatingService', () => {
  it('returns one result per vehicle the reader returns', async () => {
    const vehicles = [suv('suv-1', 100), suv('suv-2', 200), suv('suv-3', 300)];
    const service = new DealRatingService(new FakeVehicleReader(vehicles));

    const results = await service.list();

    expect(results).toHaveLength(3);
    expect(results.map((result) => result.vehicleId).sort()).toEqual(['suv-1', 'suv-2', 'suv-3']);
  });
});
