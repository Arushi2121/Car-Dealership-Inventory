import type { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import { AuthService, authRouter, PrismaUserRepository } from './modules/auth/index.js';
import { DealRatingService, dealRatingRouter } from './modules/deal-rating/index.js';
import { InventoryService, inventoryRouter } from './modules/inventory/index.js';
import {
  PrismaStockRepository,
  PrismaVehicleRepository,
  VehicleService,
  vehiclesRouter,
} from './modules/vehicles/index.js';
import type { Config } from './shared/config.js';
import { errorHandler } from './shared/http/errorHandler.js';
import { notFound } from './shared/http/notFound.js';

export type AppDeps = {
  prisma: PrismaClient;
  config: Config;
};

/** Builds the Express app without listening, so tests can drive it through Supertest. */
export function createApp({ prisma, config }: AppDeps) {
  const app = express();

  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(express.json());

  // Express 5 forwards rejected promises to errorHandler, so routes need no try/catch.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // The Vehicle table is reached through two narrow repositories: catalogue and stock.
  const vehicleRepository = new PrismaVehicleRepository(prisma);
  const stockRepository = new PrismaStockRepository(prisma);

  app.use('/api/auth', authRouter(new AuthService(new PrismaUserRepository(prisma), config)));
  app.use('/api/vehicles', vehiclesRouter(new VehicleService(vehicleRepository), config));
  app.use('/api/vehicles', inventoryRouter(new InventoryService(stockRepository), config));
  app.use('/api/deal-ratings', dealRatingRouter(new DealRatingService(vehicleRepository), config));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
