import 'dotenv/config';
import { seedUsers } from '../src/seed/seedUsers.js';
import { seedVehicles } from '../src/seed/seedVehicles.js';
import { loadConfig } from '../src/shared/config.js';
import { createPrismaClient } from '../src/shared/db.js';

const config = loadConfig();
const prisma = createPrismaClient(config.DATABASE_URL);

try {
  const users = await seedUsers(prisma, config);
  for (const user of users) {
    console.log(`Seeded ${user.role}: ${user.email}`);
  }
  const inserted = await seedVehicles(prisma);
  console.log(`Inserted ${inserted} vehicles`);
} finally {
  await prisma.$disconnect();
}
