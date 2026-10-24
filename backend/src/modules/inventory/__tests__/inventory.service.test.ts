import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConflictError, NotFoundError } from '../../../shared/errors.js';
import type { StockRepository, Vehicle } from '../../vehicles/index.js';
import { InventoryService } from '../inventory.service.js';

/** In-memory stand-in for the Prisma stock repository, so the rules are tested without a database. */
class FakeStockRepository implements StockRepository {
  vehicles: Vehicle[] = [];

  add(quantity: number): Vehicle {
    const now = new Date();
    const vehicle: Vehicle = {
      id: randomUUID(),
      make: 'Toyota',
      model: 'Corolla',
      category: 'SEDAN',
      price: 2500000,
      quantity,
      imageUrl: null,
      createdAt: now,
      updatedAt: now,
    };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async findById(id: string) {
    return this.vehicles.find((v) => v.id === id) ?? null;
  }

  async decrementIfAvailable(id: string, n: number) {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle || vehicle.quantity < n) return false;
    vehicle.quantity -= n;
    return true;
  }

  async increment(id: string, n: number) {
    const vehicle = this.vehicles.find((v) => v.id === id);
    if (!vehicle) return null;
    vehicle.quantity += n;
    return vehicle;
  }
}

describe('InventoryService', () => {
  let repo: FakeStockRepository;
  let service: InventoryService;

  beforeEach(() => {
    repo = new FakeStockRepository();
    service = new InventoryService(repo);
  });

  describe('purchase', () => {
    it('lowers the stock and returns the updated vehicle', async () => {
      const vehicle = repo.add(5);

      const updated = await service.purchase(vehicle.id, 2);

      expect(updated).toMatchObject({ id: vehicle.id, quantity: 3 });
      expect(repo.vehicles[0].quantity).toBe(3);
    });

    it('throws NotFoundError VEHICLE_NOT_FOUND for an unknown id', async () => {
      const attempt = service.purchase(randomUUID(), 1);

      await expect(attempt).rejects.toBeInstanceOf(NotFoundError);
      await expect(attempt).rejects.toMatchObject({ code: 'VEHICLE_NOT_FOUND' });
    });

    it('throws ConflictError OUT_OF_STOCK for more than the stock, leaving it unchanged', async () => {
      const vehicle = repo.add(2);

      const attempt = service.purchase(vehicle.id, 3);

      await expect(attempt).rejects.toBeInstanceOf(ConflictError);
      await expect(attempt).rejects.toMatchObject({ code: 'OUT_OF_STOCK' });
      expect(repo.vehicles[0].quantity).toBe(2);
    });
  });

  describe('restock', () => {
    it('raises the stock and returns the updated vehicle', async () => {
      const vehicle = repo.add(2);

      const updated = await service.restock(vehicle.id, 5);

      expect(updated).toMatchObject({ id: vehicle.id, quantity: 7 });
      expect(repo.vehicles[0].quantity).toBe(7);
    });

    it('throws NotFoundError VEHICLE_NOT_FOUND for an unknown id', async () => {
      const attempt = service.restock(randomUUID(), 5);

      await expect(attempt).rejects.toBeInstanceOf(NotFoundError);
      await expect(attempt).rejects.toMatchObject({ code: 'VEHICLE_NOT_FOUND' });
    });
  });
});
