import type { Vehicle } from '@prisma/client';
import { NotFoundError } from '../../shared/errors.js';
import type { VehicleRepository } from './vehicles.repository.js';
import type {
  CreateVehicleInput,
  SearchVehicleFilters,
  UpdateVehicleInput,
} from './vehicles.schemas.js';

function vehicleNotFound(): NotFoundError {
  return new NotFoundError('Vehicle not found', 'VEHICLE_NOT_FOUND');
}

/** Catalogue rules for vehicles. Stock changes live in the inventory module. */
export class VehicleService {
  constructor(private readonly repo: VehicleRepository) {}

  create(data: CreateVehicleInput): Promise<Vehicle> {
    return this.repo.create(data);
  }

  /** Every vehicle, including those out of stock. */
  list(): Promise<Vehicle[]> {
    return this.repo.findMany({});
  }

  search(filters: SearchVehicleFilters): Promise<Vehicle[]> {
    return this.repo.findMany(filters);
  }

  /** Throws VEHICLE_NOT_FOUND for an unknown id. */
  async update(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    const vehicle = await this.repo.update(id, data);
    if (!vehicle) throw vehicleNotFound();
    return vehicle;
  }

  /** Throws VEHICLE_NOT_FOUND for an unknown id. */
  async remove(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw vehicleNotFound();
  }
}
