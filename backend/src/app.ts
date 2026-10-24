import type { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import { AuthService, authRouter, PrismaUserRepository } from './modules/auth/index.js';
import {
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

  // One repository instance, shared by every module that reads or writes the Vehicle table.
  const vehicleRepository = new PrismaVehicleRepository(prisma);

  app.use('/api/auth', authRouter(new AuthService(new PrismaUserRepository(prisma), config)));
  app.use('/api/vehicles', vehiclesRouter(new VehicleService(vehicleRepository), config));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
