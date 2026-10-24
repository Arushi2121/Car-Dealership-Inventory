import type { Request, Response } from 'express';
import type { InventoryService } from './inventory.service.js';

type IdParams = { id: string };

export function createInventoryController(service: InventoryService) {
  return {
    async purchase(req: Request<IdParams>, res: Response) {
      res.status(200).json(await service.purchase(req.params.id, req.body.quantity));
    },

    async restock(req: Request<IdParams>, res: Response) {
      res.status(200).json(await service.restock(req.params.id, req.body.quantity));
    },
  };
}
