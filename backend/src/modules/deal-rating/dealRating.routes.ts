import { Router } from 'express';
import type { Config } from '../../shared/config.js';
import { authenticate } from '../../shared/http/authenticate.js';
import { createDealRatingController } from './dealRating.controller.js';
import type { DealRatingService } from './dealRating.service.js';

export function dealRatingRouter(service: DealRatingService, config: Config): Router {
  const controller = createDealRatingController(service);
  const router = Router();

  router.get('/', authenticate(config), controller.list);

  return router;
}
