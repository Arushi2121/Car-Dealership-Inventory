import type { Request, Response } from 'express';
import type { VehicleService } from './vehicles.service.js';

type IdParams = { id: string };

export function createVehiclesController(service: VehicleService) {
  return {
    async create(req: Request, res: Response) {
      res.status(201).json(await service.create(req.body));
    },

    async list(_req: Request, res: Response) {
      res.status(200).json(await service.list());
    },

    async search(_req: Request, res: Response) {
      res.status(200).json(await service.search(res.locals.query));
    },

    async update(req: Request<IdParams>, res: Response) {
      res.status(200).json(await service.update(req.params.id, req.body));
    },

    async remove(req: Request<IdParams>, res: Response) {
      await service.remove(req.params.id);
      res.status(204).end();
    },
  };
}
