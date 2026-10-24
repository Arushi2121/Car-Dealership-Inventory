import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../../../shared/config.js';
import { createUserWithToken } from '../../../../tests/helpers/auth.js';
import { createTestApp } from '../../../../tests/helpers/createTestApp.js';
import { resetDatabase } from '../../../../tests/helpers/db.js';
import { makeVehicle } from '../../../../tests/helpers/vehicles.js';

const config = loadConfig();

describe('inventory routes', () => {
  let testApp: ReturnType<typeof createTestApp>;
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    testApp = createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(testApp.prisma);
    adminToken = (await createUserWithToken(testApp.prisma, config, 'ADMIN')).token;
    userToken = (await createUserWithToken(testApp.prisma, config)).token;
  });

  afterAll(async () => {
    await testApp.prisma.$disconnect();
  });

  const api = () => request(testApp.app);
  const bearer = (token: string) => `Bearer ${token}`;
  const purchase = (id: string, token = userToken) =>
    api().post(`/api/vehicles/${id}/purchase`).set('Authorization', bearer(token));
  const restock = (id: string, token = adminToken) =>
    api().post(`/api/vehicles/${id}/restock`).set('Authorization', bearer(token));
  const storedQuantity = async (id: string) =>
    (await testApp.prisma.vehicle.findUniqueOrThrow({ where: { id } })).quantity;

  describe('auth guards', () => {
    it.each(['purchase', 'restock'])(
      'POST /api/vehicles/:id/%s returns 401 without a token',
      async (action) => {
        const vehicle = await makeVehicle(testApp.prisma);

        const res = await api().post(`/api/vehicles/${vehicle.id}/${action}`).send({ quantity: 1 });

        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      },
    );

    it('restock returns 403 FORBIDDEN with a USER token', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 2 });

      const res = await restock(vehicle.id, userToken).send({ quantity: 5 });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(await storedQuantity(vehicle.id)).toBe(2);
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('buys one when there is no body and returns the updated vehicle', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 5 });

      const res = await purchase(vehicle.id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: vehicle.id, quantity: 4 });
      expect(await storedQuantity(vehicle.id)).toBe(4);
    });

    it('buys the quantity sent', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 5 });

      const res = await purchase(vehicle.id).send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(2);
      expect(await storedQuantity(vehicle.id)).toBe(2);
    });

    it('lets an admin purchase too', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 5 });

      const res = await purchase(vehicle.id, adminToken);

      expect(res.status).toBe(200);
      expect(await storedQuantity(vehicle.id)).toBe(4);
    });

    it.each([
      ['the vehicle is out of stock', 0, {}],
      ['the quantity is more than the stock', 5, { quantity: 6 }],
    ])(
      'returns 409 OUT_OF_STOCK when %s, leaving the stock unchanged',
      async (_case, stock, body) => {
        const vehicle = await makeVehicle(testApp.prisma, { quantity: stock });

        const res = await purchase(vehicle.id).send(body);

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('OUT_OF_STOCK');
        expect(await storedQuantity(vehicle.id)).toBe(stock);
      },
    );

    it('returns 400 VALIDATION_ERROR for quantity 0', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 5 });

      const res = await purchase(vehicle.id).send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(await storedQuantity(vehicle.id)).toBe(5);
    });

    it('returns 404 VEHICLE_NOT_FOUND for an unknown id', async () => {
      const res = await purchase(randomUUID());

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('VEHICLE_NOT_FOUND');
    });

    it('sells the last unit exactly once when five purchases race for it', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 1 });

      const responses = await Promise.all(Array.from({ length: 5 }, () => purchase(vehicle.id)));

      const statuses = responses.map((res) => res.status);
      expect(statuses.filter((status) => status === 200)).toHaveLength(1);
      expect(statuses.filter((status) => status === 409)).toHaveLength(4);
      expect(await storedQuantity(vehicle.id)).toBe(0);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('lets an admin add stock and returns the updated vehicle', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 2 });

      const res = await restock(vehicle.id).send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: vehicle.id, quantity: 7 });
      expect(await storedQuantity(vehicle.id)).toBe(7);
    });

    it('returns 400 VALIDATION_ERROR for quantity 0', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 2 });

      const res = await restock(vehicle.id).send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(await storedQuantity(vehicle.id)).toBe(2);
    });

    it('returns 404 VEHICLE_NOT_FOUND for an unknown id', async () => {
      const res = await restock(randomUUID()).send({ quantity: 5 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('VEHICLE_NOT_FOUND');
    });
  });
});
