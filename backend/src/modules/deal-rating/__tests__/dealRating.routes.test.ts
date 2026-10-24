import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../../../shared/config.js';
import { createUserWithToken } from '../../../../tests/helpers/auth.js';
import { createTestApp } from '../../../../tests/helpers/createTestApp.js';
import { resetDatabase } from '../../../../tests/helpers/db.js';
import { makeVehicle } from '../../../../tests/helpers/vehicles.js';

const config = loadConfig();

type DealRatingBody = {
  vehicleId: string;
  rating: 'GREAT' | 'FAIR' | 'ABOVE_MARKET' | null;
  categoryMedian: number | null;
  differencePercent: number | null;
};

describe('deal rating routes', () => {
  let testApp: ReturnType<typeof createTestApp>;
  let userToken: string;

  beforeAll(() => {
    testApp = createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(testApp.prisma);
    userToken = (await createUserWithToken(testApp.prisma, config)).token;
  });

  afterAll(async () => {
    await testApp.prisma.$disconnect();
  });

  const api = () => request(testApp.app);

  it('GET /api/deal-ratings returns 401 without a token', async () => {
    const res = await api().get('/api/deal-ratings');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rates three sedans against their median and leaves a lone SUV unrated', async () => {
    const cheap = await makeVehicle(testApp.prisma, {
      category: 'SEDAN',
      price: 2000000,
      model: 'Cheap',
    });
    const mid = await makeVehicle(testApp.prisma, {
      category: 'SEDAN',
      price: 2500000,
      model: 'Mid',
    });
    const expensive = await makeVehicle(testApp.prisma, {
      category: 'SEDAN',
      price: 3000000,
      model: 'Expensive',
    });
    const suv = await makeVehicle(testApp.prisma, {
      category: 'SUV',
      price: 4000000,
      model: 'Lone',
    });

    const res = await api().get('/api/deal-ratings').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    const ratings = res.body as DealRatingBody[];
    expect(ratings).toHaveLength(4);
    expect(ratings).toEqual(
      expect.arrayContaining<DealRatingBody>([
        {
          vehicleId: cheap.id,
          rating: 'GREAT',
          categoryMedian: 2500000,
          differencePercent: -20,
        },
        {
          vehicleId: mid.id,
          rating: 'FAIR',
          categoryMedian: 2500000,
          differencePercent: 0,
        },
        {
          vehicleId: expensive.id,
          rating: 'ABOVE_MARKET',
          categoryMedian: 2500000,
          differencePercent: 20,
        },
        {
          vehicleId: suv.id,
          rating: null,
          categoryMedian: null,
          differencePercent: null,
        },
      ]),
    );
  });
});
