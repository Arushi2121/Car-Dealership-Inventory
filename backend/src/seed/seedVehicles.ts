import type { PrismaClient } from '@prisma/client';
import { demoVehicles } from './demoVehicles.js';

/** Fills an empty inventory. A later run does nothing, so admin edits are never overwritten. */
export async function seedVehicles(prisma: PrismaClient): Promise<number> {
  if ((await prisma.vehicle.count()) > 0) return 0;

  const result = await prisma.vehicle.createMany({ data: demoVehicles });
  return result.count;
}
