import type { Vehicle } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundError } from '../../../shared/errors.js';
import type { VehicleRepository } from '../vehicles.repository.js';
import type { CreateVehicleInput, UpdateVehicleInput } from '../vehicles.schemas.js';
import { VehicleService } from '../vehicles.service.js';

/** In-memory stand-in for the Prisma repository, so the service is tested without a database. */
class FakeVehicleRepository implements VehicleRepository {
  vehicles: Vehicle[] = [];

  async findMany(): Promise<Vehicle[]> {
    // Filtering and ordering are SQL concerns, covered by the route tests against Postgres.
    throw new Error('findMany is not used by these tests');
  }

  async create(data: CreateVehicleInput) {
    const now = new Date();
    const vehicle: Vehicle = {
      id: randomUUID(),
      make: data.make,
      model: data.model,
      category: data.category,
      price: data.price,
      quantity: data.quantity,
      imageUrl: data.imageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async update(id: string, data: UpdateVehicleInput) {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle) return null;
    Object.assign(vehicle, data, { updatedAt: new Date() });
    return vehicle;
  }

  async delete(id: string) {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle) return null;
    this.vehicles = this.vehicles.filter((v) => v.id !== id);
    return vehicle;
  }
}

const corolla: CreateVehicleInput = {
  make: 'Toyota',
  model: 'Corolla',
  category: 'SEDAN',
  price: 2500000,
  quantity: 5,
};

describe('VehicleService', () => {
  let repo: FakeVehicleRepository;
  let service: VehicleService;

  beforeEach(() => {
    repo = new FakeVehicleRepository();
    service = new VehicleService(repo);
  });

  it('create returns the vehicle the repository created', async () => {
    const vehicle = await service.create(corolla);

    expect(vehicle).toBe(repo.vehicles[0]);
    expect(vehicle).toMatchObject(corolla);
  });

  it('update on an unknown id throws NotFoundError VEHICLE_NOT_FOUND', async () => {
    const attempt = service.update(randomUUID(), { price: 100 });

    await expect(attempt).rejects.toBeInstanceOf(NotFoundError);
    await expect(attempt).rejects.toMatchObject({ code: 'VEHICLE_NOT_FOUND' });
  });

  it('remove on an unknown id throws NotFoundError VEHICLE_NOT_FOUND', async () => {
    const attempt = service.remove(randomUUID());

    await expect(attempt).rejects.toBeInstanceOf(NotFoundError);
    await expect(attempt).rejects.toMatchObject({ code: 'VEHICLE_NOT_FOUND' });
  });
});
