import type { PrismaClient, Role, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { Config } from '../shared/config.js';

const BCRYPT_COST = 10;

async function upsertUser(prisma: PrismaClient, email: string, password: string, role: Role) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  return prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, role },
    update: { passwordHash, role },
  });
}

/** Creates or updates the admin and demo accounts from config. Safe to run repeatedly. */
export async function seedUsers(prisma: PrismaClient, config: Config): Promise<User[]> {
  const admin = await upsertUser(prisma, config.ADMIN_EMAIL, config.ADMIN_PASSWORD, 'ADMIN');
  const demo = await upsertUser(prisma, config.DEMO_USER_EMAIL, config.DEMO_USER_PASSWORD, 'USER');
  return [admin, demo];
}
