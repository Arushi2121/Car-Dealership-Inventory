import type { PrismaClient, Role, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { signToken } from '../../src/shared/auth/token.js';
import type { Config } from '../../src/shared/config.js';

// Lowest cost bcrypt allows; these hashes only need to be valid, not strong, and tests stay fast.
const TEST_BCRYPT_COST = 4;

/** Creates a user straight in the database, bypassing register, so tests can get an ADMIN too. */
export async function createUserWithToken(
  prisma: PrismaClient,
  config: Config,
  role: Role = 'USER',
): Promise<{ user: User; token: string }> {
  const user = await prisma.user.create({
    data: {
      email: `${role.toLowerCase()}-${randomUUID()}@example.com`,
      passwordHash: await bcrypt.hash('password123', TEST_BCRYPT_COST),
      role,
    },
  });
  const token = signToken({ sub: user.id, role: user.role }, config);
  return { user, token };
}
