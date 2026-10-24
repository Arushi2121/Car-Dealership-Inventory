import type { Request, Response } from 'express';
import type { DealRatingService } from './dealRating.service.js';

export function createDealRatingController(service: DealRatingService) {
  return {
    async list(_req: Request, res: Response) {
      res.status(200).json(await service.list());
    },
  };
}
