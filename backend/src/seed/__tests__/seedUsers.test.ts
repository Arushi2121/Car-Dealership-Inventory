import bcrypt from 'bcrypt';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../../../tests/helpers/db.js';
import { loadConfig } from '../../shared/config.js';
import { createPrismaClient } from '../../shared/db.js';
import { seedUsers } from '../seedUsers.js';

const config = loadConfig();
const prisma = createPrismaClient(config.DATABASE_URL);

describe('seedUsers', () => {
  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('is safe to rerun: leaves exactly one admin and one demo user', async () => {
    await seedUsers(prisma, config);
    await seedUsers(prisma, config);

    const users = await prisma.user.findMany();
    const admins = users.filter((user) => user.role === 'ADMIN');
    const regulars = users.filter((user) => user.role === 'USER');

    expect(users).toHaveLength(2);
    expect(admins).toHaveLength(1);
    expect(admins[0].email).toBe(config.ADMIN_EMAIL);
    expect(regulars).toHaveLength(1);
    expect(regulars[0].email).toBe(config.DEMO_USER_EMAIL);
  });

  it("stores a hash that matches the admin's configured password", async () => {
    await seedUsers(prisma, config);

    const admin = await prisma.user.findUniqueOrThrow({ where: { email: config.ADMIN_EMAIL } });
    expect(await bcrypt.compare(config.ADMIN_PASSWORD, admin.passwordHash)).toBe(true);
  });
});
