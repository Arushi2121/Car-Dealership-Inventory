import type { Prisma, PrismaClient, Vehicle } from '@prisma/client';

/** Creates a vehicle with sensible defaults; pass only the fields a test cares about. */
export function makeVehicle(
  prisma: PrismaClient,
  overrides: Partial<Prisma.VehicleCreateInput> = {},
): Promise<Vehicle> {
  return prisma.vehicle.create({
    data: {
      make: 'Toyota',
      model: 'Corolla',
      category: 'SEDAN',
      price: 2500000,
      quantity: 5,
      ...overrides,
    },
  });
}
