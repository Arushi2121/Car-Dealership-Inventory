import { Router } from 'express';
import type { Config } from '../../shared/config.js';
import { authenticate } from '../../shared/http/authenticate.js';
import { requireAdmin } from '../../shared/http/requireAdmin.js';
import { validate } from '../../shared/http/validate.js';
import { createInventoryController } from './inventory.controller.js';
import { purchaseSchema, restockSchema } from './inventory.schemas.js';
import type { InventoryService } from './inventory.service.js';

export function inventoryRouter(service: InventoryService, config: Config): Router {
  const controller = createInventoryController(service);
  const router = Router();
  const signedIn = authenticate(config);

  router.post('/:id/purchase', signedIn, validate(purchaseSchema, 'body'), controller.purchase);
  router.post(
    '/:id/restock',
    signedIn,
    requireAdmin,
    validate(restockSchema, 'body'),
    controller.restock,
  );

  return router;
}
