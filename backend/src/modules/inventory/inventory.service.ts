import { ConflictError, NotFoundError } from '../../shared/errors.js';
import type { StockRepository, Vehicle } from '../vehicles/index.js';

function vehicleNotFound(): NotFoundError {
  return new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
}

/** Purchase and restock rules. The stock SQL lives in the vehicles module. */
export class InventoryService {
  constructor(private readonly stockRepo: StockRepository) {}

  /** Throws VEHICLE_NOT_FOUND for an unknown id, OUT_OF_STOCK when stock is below quantity. */
  async purchase(id: string, quantity: number): Promise<Vehicle> {
    const decremented = await this.stockRepo.decrementIfAvailable(id, quantity);
    const vehicle = await this.stockRepo.findById(id);
    if (!vehicle) throw vehicleNotFound();
    if (!decremented) throw new ConflictError('Not enough stock', 'OUT_OF_STOCK');
    return vehicle;
  }

  /** Throws VEHICLE_NOT_FOUND for an unknown id. */
  async restock(id: string, quantity: number): Promise<Vehicle> {
    const vehicle = await this.stockRepo.increment(id, quantity);
    if (!vehicle) throw vehicleNotFound();
    return vehicle;
  }
}
