import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../../tests/helpers/db.js';
import { loadConfig } from '../../shared/config.js';
import { createPrismaClient } from '../../shared/db.js';
import { demoVehicles } from '../demoVehicles.js';
import { seedVehicles } from '../seedVehicles.js';

const prisma = createPrismaClient(loadConfig().DATABASE_URL);

type CatalogueVehicle = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
};

function catalogueEntry(vehicle: CatalogueVehicle): CatalogueVehicle {
  return {
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    price: vehicle.price,
    quantity: vehicle.quantity,
  };
}

function byCatalogueEntry(a: CatalogueVehicle, b: CatalogueVehicle): number {
  return `${a.make}|${a.model}|${a.category}|${a.price}|${a.quantity}`.localeCompare(
    `${b.make}|${b.model}|${b.category}|${b.price}|${b.quantity}`,
  );
}

describe('seedVehicles', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('inserts every demo vehicle when the table is empty', async () => {
    await seedVehicles(prisma);

    const stored = await prisma.vehicle.findMany();

    expect(stored.map(catalogueEntry).sort(byCatalogueEntry)).toEqual(
      demoVehicles.map(catalogueEntry).sort(byCatalogueEntry),
    );
  });

  it('leaves existing inventory unchanged when it runs again', async () => {
    await seedVehicles(prisma);
    const first = await prisma.vehicle.findFirstOrThrow();
    await prisma.vehicle.update({ where: { id: first.id }, data: { price: first.price + 1 } });

    await seedVehicles(prisma);

    const again = await prisma.vehicle.findUniqueOrThrow({ where: { id: first.id } });
    expect(await prisma.vehicle.count()).toBe(demoVehicles.length);
    expect(again.price).toBe(first.price + 1);
  });

  it('includes at least three sedans, SUVs and hatchbacks, and two with no stock', () => {
    const count = (category: string) =>
      demoVehicles.filter((vehicle) => vehicle.category === category).length;

    expect(count('SEDAN')).toBeGreaterThanOrEqual(3);
    expect(count('SUV')).toBeGreaterThanOrEqual(3);
    expect(count('HATCHBACK')).toBeGreaterThanOrEqual(3);
    expect(demoVehicles.filter((vehicle) => vehicle.quantity === 0).length).toBeGreaterThanOrEqual(
      2,
    );
  });
});
