import { createApp } from '../../src/app.js';
import { loadConfig } from '../../src/shared/config.js';
import { createPrismaClient } from '../../src/shared/db.js';

/** Builds the real app against the test database. Callers disconnect `prisma` in afterAll. */
export function createTestApp() {
  const config = loadConfig();
  const prisma = createPrismaClient(config.DATABASE_URL);
  const app = createApp({ prisma, config });
  return { app, prisma };
}
