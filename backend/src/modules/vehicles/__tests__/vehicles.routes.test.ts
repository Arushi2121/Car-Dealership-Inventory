import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../../../shared/config.js';
import { createUserWithToken } from '../../../../tests/helpers/auth.js';
import { createTestApp } from '../../../../tests/helpers/createTestApp.js';
import { resetDatabase } from '../../../../tests/helpers/db.js';
import { makeVehicle } from '../../../../tests/helpers/vehicles.js';

const config = loadConfig();

const newVehicle = {
  make: 'Mazda',
  model: 'CX-5',
  category: 'SUV',
  price: 2899900,
  quantity: 3,
  imageUrl: 'https://example.com/cx5.jpg',
};

type VehicleBody = { make: string; model: string };

/** "Make Model" for each vehicle in a response, so order and contents read in one assertion. */
function namesOf(body: VehicleBody[]): string[] {
  return body.map((vehicle) => `${vehicle.make} ${vehicle.model}`);
}

describe('vehicle routes', () => {
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
  const search = (query: Record<string, string>) =>
    api().get('/api/vehicles/search').query(query).set('Authorization', bearer(userToken));

  describe('auth guards', () => {
    const id = randomUUID();

    it.each([
      ['post', '/api/vehicles'],
      ['get', '/api/vehicles'],
      ['get', '/api/vehicles/search'],
      ['put', `/api/vehicles/${id}`],
      ['delete', `/api/vehicles/${id}`],
    ] as const)('%s %s returns 401 without a token', async (method, path) => {
      const res = await api()[method](path);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it.each([
      ['post', () => '/api/vehicles', newVehicle],
      ['put', (vehicleId: string) => `/api/vehicles/${vehicleId}`, { price: 100 }],
      ['delete', (vehicleId: string) => `/api/vehicles/${vehicleId}`, undefined],
    ] as const)('%s returns 403 with a USER token', async (method, pathFor, body) => {
      const existing = await makeVehicle(testApp.prisma);

      const res = await api()
        [method](pathFor(existing.id))
        .set('Authorization', bearer(userToken))
        .send(body);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/vehicles', () => {
    it('lets an admin create a vehicle and returns every field', async () => {
      const res = await api()
        .post('/api/vehicles')
        .set('Authorization', bearer(adminToken))
        .send(newVehicle);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        ...newVehicle,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('returns 400 VALIDATION_ERROR for an invalid body', async () => {
      const res = await api()
        .post('/api/vehicles')
        .set('Authorization', bearer(adminToken))
        .send({ ...newVehicle, price: -1 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/vehicles', () => {
    it('returns every vehicle, including out of stock, ordered by make then model', async () => {
      await makeVehicle(testApp.prisma, { make: 'Toyota', model: 'Corolla' });
      await makeVehicle(testApp.prisma, { make: 'Honda', model: 'Civic', quantity: 0 });
      await makeVehicle(testApp.prisma, { make: 'Toyota', model: 'Camry' });
      await makeVehicle(testApp.prisma, { make: 'Audi', model: 'A4' });

      const res = await api().get('/api/vehicles').set('Authorization', bearer(userToken));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(namesOf(res.body)).toEqual([
        'Audi A4',
        'Honda Civic',
        'Toyota Camry',
        'Toyota Corolla',
      ]);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      await makeVehicle(testApp.prisma, {
        make: 'Ford',
        model: 'Mustang',
        category: 'COUPE',
        price: 4500000,
      });
      await makeVehicle(testApp.prisma, {
        make: 'Honda',
        model: 'Civic',
        category: 'HATCHBACK',
        price: 2200000,
      });
      await makeVehicle(testApp.prisma, {
        make: 'Honda',
        model: 'Pilot',
        category: 'SUV',
        price: 3500000,
      });
      await makeVehicle(testApp.prisma, {
        make: 'Toyota',
        model: 'Corolla',
        category: 'SEDAN',
        price: 2000000,
      });
      await makeVehicle(testApp.prisma, {
        make: 'Toyota',
        model: 'RAV4',
        category: 'SUV',
        price: 3000000,
      });
    });

    it('matches make partially, ignoring case', async () => {
      const res = await search({ make: 'toy' });

      expect(res.status).toBe(200);
      expect(namesOf(res.body)).toEqual(['Toyota Corolla', 'Toyota RAV4']);
    });

    it('matches model partially, ignoring case', async () => {
      const res = await search({ model: 'CIV' });

      expect(res.status).toBe(200);
      expect(namesOf(res.body)).toEqual(['Honda Civic']);
    });

    it('matches category exactly', async () => {
      const res = await search({ category: 'SUV' });

      expect(res.status).toBe(200);
      expect(namesOf(res.body)).toEqual(['Honda Pilot', 'Toyota RAV4']);
    });

    it('treats minPrice and maxPrice as inclusive bounds', async () => {
      const res = await search({ minPrice: '2200000', maxPrice: '3500000' });

      expect(res.status).toBe(200);
      expect(namesOf(res.body)).toEqual(['Honda Civic', 'Honda Pilot', 'Toyota RAV4']);
    });

    it.each([
      ['only minPrice', { minPrice: '3500000' }, ['Ford Mustang', 'Honda Pilot']],
      ['only maxPrice', { maxPrice: '2200000' }, ['Honda Civic', 'Toyota Corolla']],
    ])('works with %s', async (_case, query, expected) => {
      const res = await search(query);

      expect(res.status).toBe(200);
      expect(namesOf(res.body)).toEqual(expected);
    });

    it('combines filters, returning only vehicles that match all of them', async () => {
      // Each filter alone matches two or three vehicles; only the Pilot matches all three.
      const res = await search({ make: 'honda', category: 'SUV', minPrice: '3000000' });

      expect(res.status).toBe(200);
      expect(namesOf(res.body)).toEqual(['Honda Pilot']);
    });

    it('returns everything when no filters are given', async () => {
      const res = await search({});

      expect(res.status).toBe(200);
      expect(namesOf(res.body)).toEqual([
        'Ford Mustang',
        'Honda Civic',
        'Honda Pilot',
        'Toyota Corolla',
        'Toyota RAV4',
      ]);
    });

    it('returns 400 VALIDATION_ERROR when minPrice is greater than maxPrice', async () => {
      const res = await search({ minPrice: '500', maxPrice: '100' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('changes only the fields sent and returns the updated vehicle', async () => {
      const vehicle = await makeVehicle(testApp.prisma);

      const res = await api()
        .put(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', bearer(adminToken))
        .send({ price: 1999900 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: vehicle.id,
        make: 'Toyota',
        model: 'Corolla',
        category: 'SEDAN',
        price: 1999900,
        quantity: 5,
      });
      const stored = await testApp.prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
      expect(stored.price).toBe(1999900);
      expect(stored.make).toBe('Toyota');
    });

    it('returns 400 for a body with quantity and leaves the stock unchanged', async () => {
      const vehicle = await makeVehicle(testApp.prisma, { quantity: 5 });

      const res = await api()
        .put(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', bearer(adminToken))
        .send({ quantity: 99 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      const stored = await testApp.prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
      expect(stored.quantity).toBe(5);
    });

    it.each([
      ['an unknown id', randomUUID()],
      ['a malformed id', 'not-a-uuid'],
    ])('returns 404 VEHICLE_NOT_FOUND for %s', async (_case, id) => {
      const res = await api()
        .put(`/api/vehicles/${id}`)
        .set('Authorization', bearer(adminToken))
        .send({ price: 100 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('VEHICLE_NOT_FOUND');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('lets an admin delete a vehicle, which then disappears from the list', async () => {
      const vehicle = await makeVehicle(testApp.prisma);

      const res = await api()
        .delete(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', bearer(adminToken));

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
      const list = await api().get('/api/vehicles').set('Authorization', bearer(userToken));
      expect(list.body).toEqual([]);
    });

    it.each([
      ['an unknown id', randomUUID()],
      ['a malformed id', 'not-a-uuid'],
    ])('returns 404 VEHICLE_NOT_FOUND for %s', async (_case, id) => {
      const res = await api()
        .delete(`/api/vehicles/${id}`)
        .set('Authorization', bearer(adminToken));

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('VEHICLE_NOT_FOUND');
    });
  });
});
