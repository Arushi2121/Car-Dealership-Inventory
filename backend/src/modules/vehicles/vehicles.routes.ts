import { Router } from 'express';
import type { Config } from '../../shared/config.js';
import { authenticate } from '../../shared/http/authenticate.js';
import { requireAdmin } from '../../shared/http/requireAdmin.js';
import { validate } from '../../shared/http/validate.js';
import { createVehiclesController } from './vehicles.controller.js';
import {
  createVehicleSchema,
  searchVehicleSchema,
  updateVehicleSchema,
} from './vehicles.schemas.js';
import type { VehicleService } from './vehicles.service.js';

export function vehiclesRouter(service: VehicleService, config: Config): Router {
  const controller = createVehiclesController(service);
  const router = Router();
  const signedIn = authenticate(config);

  router.get('/', signedIn, controller.list);
  // Registered before any /:id route, so "search" is never read as an id.
  router.get('/search', signedIn, validate(searchVehicleSchema, 'query'), controller.search);

  router.post(
    '/',
    signedIn,
    requireAdmin,
    validate(createVehicleSchema, 'body'),
    controller.create,
  );
  router.put(
    '/:id',
    signedIn,
    requireAdmin,
    validate(updateVehicleSchema, 'body'),
    controller.update,
  );
  router.delete('/:id', signedIn, requireAdmin, controller.remove);

  return router;
}
