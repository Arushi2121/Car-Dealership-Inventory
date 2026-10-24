import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from '../../../../tests/helpers/createTestApp.js';
import { resetDatabase } from '../../../../tests/helpers/db.js';

const ada = { email: 'ada@example.com', password: 'correct-horse', name: 'Ada' };

describe('auth routes', () => {
  let testApp: ReturnType<typeof createTestApp>;

  beforeAll(() => {
    testApp = createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(testApp.prisma);
  });

  afterAll(async () => {
    await testApp.prisma.$disconnect();
  });

  const register = (body: object) => request(testApp.app).post('/api/auth/register').send(body);
  const login = (body: object) => request(testApp.app).post('/api/auth/login').send(body);

  describe('POST /api/auth/register', () => {
    it('creates a USER and returns it with a token, never the hash', async () => {
      const res = await register(ada);

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ email: ada.email, name: ada.name, role: 'USER' });
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.text).not.toContain('passwordHash');
    });

    it('ignores a role in the body and still creates a USER', async () => {
      const res = await register({ ...ada, role: 'ADMIN' });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('USER');
    });

    it('returns 409 EMAIL_TAKEN for the same email in different case', async () => {
      await register(ada);

      const res = await register({ ...ada, email: 'ADA@Example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_TAKEN');
    });

    it.each([
      ['an invalid email', { ...ada, email: 'not-an-email' }],
      ['a password under 8 characters', { ...ada, password: 'short' }],
      // bcrypt ignores everything past 72 bytes, so longer passwords would silently be truncated.
      ['a password over 72 characters', { ...ada, password: 'a'.repeat(73) }],
    ])('returns 400 VALIDATION_ERROR for %s', async (_case, body) => {
      const res = await register(body);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await register(ada);
    });

    it('returns 200 with the user and a token for correct credentials', async () => {
      const res = await login({ email: ada.email, password: ada.password });

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({ email: ada.email, role: 'USER' });
      expect(res.body.token).toEqual(expect.any(String));
    });

    it('returns the same 401 body for a wrong password and an unknown email', async () => {
      const wrongPassword = await login({ email: ada.email, password: 'wrong-password' });
      const unknownEmail = await login({ email: 'nobody@example.com', password: ada.password });

      expect(wrongPassword.status).toBe(401);
      expect(unknownEmail.status).toBe(401);
      expect(wrongPassword.body).toEqual(unknownEmail.body);
    });
  });
});
