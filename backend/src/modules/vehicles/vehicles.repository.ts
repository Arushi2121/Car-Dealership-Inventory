import { Prisma, type PrismaClient, type Vehicle } from '@prisma/client';
import type {
  CreateVehicleInput,
  SearchVehicleFilters,
  UpdateVehicleInput,
} from './vehicles.schemas.js';

export interface VehicleRepository {
  /** Empty filters return every vehicle. Results are ordered by make, then model. */
  findMany(filters: SearchVehicleFilters): Promise<Vehicle[]>;
  create(data: CreateVehicleInput): Promise<Vehicle>;
  /** Returns null when no vehicle has this id. */
  update(id: string, data: UpdateVehicleInput): Promise<Vehicle | null>;
  /** Returns null when no vehicle has this id. */
  delete(id: string): Promise<Vehicle | null>;
}

// P2025 is Prisma's "record to update or delete does not exist".
function isRecordNotFound(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025';
}

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findMany({ make, model, category, minPrice, maxPrice }: SearchVehicleFilters) {
    return this.prisma.vehicle.findMany({
      where: {
        make: make ? { contains: make, mode: 'insensitive' } : undefined,
        model: model ? { contains: model, mode: 'insensitive' } : undefined,
        category,
        price: { gte: minPrice, lte: maxPrice },
      },
      orderBy: [{ make: 'asc' }, { model: 'asc' }],
    });
  }

  create(data: CreateVehicleInput) {
    return this.prisma.vehicle.create({ data });
  }

  async update(id: string, data: UpdateVehicleInput) {
    try {
      return await this.prisma.vehicle.update({ where: { id }, data });
    } catch (err) {
      if (isRecordNotFound(err)) return null;
      throw err;
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.vehicle.delete({ where: { id } });
    } catch (err) {
      if (isRecordNotFound(err)) return null;
      throw err;
    }
  }
}
