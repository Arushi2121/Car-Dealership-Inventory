import type { PrismaClient } from '@prisma/client';

/** Empties every table so each test starts from a known state. Add new tables here. */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
}
