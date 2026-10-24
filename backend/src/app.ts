import type { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import type { Config } from './shared/config.js';
import { errorHandler } from './shared/http/errorHandler.js';
import { notFound } from './shared/http/notFound.js';

export type AppDeps = {
  prisma: PrismaClient;
  config: Config;
};

/** Builds the Express app without listening, so tests can drive it through Supertest. */
export function createApp({ config }: AppDeps) {
  const app = express();

  app.use(cors({ origin: config.CORS_ORIGIN }));
  app.use(express.json());

  // Express 5 forwards rejected promises to errorHandler, so routes need no try/catch.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
