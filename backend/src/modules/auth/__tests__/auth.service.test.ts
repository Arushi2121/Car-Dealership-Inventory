import type { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { verifyToken } from '../../../shared/auth/token.js';
import { loadConfig } from '../../../shared/config.js';
import { ConflictError, UnauthorizedError } from '../../../shared/errors.js';
import { AuthService } from '../auth.service.js';
import type { UserRepository } from '../user.repository.js';

/** In-memory stand-in for the Prisma repository, so the service is tested without a database. */
class FakeUserRepository implements UserRepository {
  users: User[] = [];

  async findByEmail(email: string) {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async create(data: { email: string; passwordHash: string; name?: string | null }) {
    const user: User = {
      id: randomUUID(),
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name ?? null,
      role: 'USER',
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }
}

const config = loadConfig();

describe('AuthService', () => {
  let repo: FakeUserRepository;
  let service: AuthService;

  beforeEach(() => {
    repo = new FakeUserRepository();
    service = new AuthService(repo, config);
  });

  describe('register', () => {
    it('stores a bcrypt hash, never the plain password', async () => {
      await service.register({ email: 'ada@example.com', password: 'correct-horse' });

      const stored = repo.users[0];
      expect(stored.passwordHash).not.toBe('correct-horse');
      expect(await bcrypt.compare('correct-horse', stored.passwordHash)).toBe(true);
    });

    it('trims and lowercases the email', async () => {
      await service.register({ email: '  Ada@Example.COM ', password: 'correct-horse' });

      expect(repo.users[0].email).toBe('ada@example.com');
    });

    it('rejects an email that is already taken, ignoring case', async () => {
      await service.register({ email: 'ada@example.com', password: 'correct-horse' });

      const second = service.register({ email: 'ADA@example.com', password: 'another-pass' });

      await expect(second).rejects.toBeInstanceOf(ConflictError);
      await expect(second).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
    });

    it('returns the public user and a token, without the password hash', async () => {
      const { user, token } = await service.register({
        email: 'ada@example.com',
        password: 'correct-horse',
        name: 'Ada',
      });

      expect(user).toMatchObject({
        id: expect.any(String),
        email: 'ada@example.com',
        name: 'Ada',
        role: 'USER',
      });
      expect(user).not.toHaveProperty('passwordHash');
      expect(token).toEqual(expect.any(String));
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await service.register({ email: 'ada@example.com', password: 'correct-horse' });
    });

    it('returns the user and a token whose sub is the user id', async () => {
      const { user, token } = await service.login({
        email: 'ada@example.com',
        password: 'correct-horse',
      });

      expect(user.email).toBe('ada@example.com');
      expect(verifyToken(token, config).sub).toBe(user.id);
    });

    it('rejects an unknown email with a generic error', async () => {
      const attempt = service.login({ email: 'nobody@example.com', password: 'correct-horse' });

      await expect(attempt).rejects.toBeInstanceOf(UnauthorizedError);
      await expect(attempt).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });

    it('rejects a wrong password with exactly the same error as an unknown email', async () => {
      const attempt = service.login({ email: 'ada@example.com', password: 'wrong-password' });

      await expect(attempt).rejects.toBeInstanceOf(UnauthorizedError);
      await expect(attempt).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });
  });
});
