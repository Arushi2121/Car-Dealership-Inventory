import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/createTestApp.js';

describe('app', () => {
  let testApp: ReturnType<typeof createTestApp>;

  beforeAll(() => {
    testApp = createTestApp();
  });

  afterAll(async () => {
    await testApp.prisma.$disconnect();
  });

  it('GET /api/health returns 200 with status ok', async () => {
    const res = await request(testApp.app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 in the standard error shape for an unknown route', async () => {
    const res = await request(testApp.app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: expect.any(String) },
    });
    expect(res.body.error.message.length).toBeGreaterThan(0);
  });

  it('returns 400 INVALID_JSON for a malformed JSON body', async () => {
    const res = await request(testApp.app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"bad":');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});
