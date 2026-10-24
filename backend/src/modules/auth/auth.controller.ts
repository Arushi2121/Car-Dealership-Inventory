import type { Request, Response } from 'express';
import type { AuthService } from './auth.service.js';

export function createAuthController(service: AuthService) {
  return {
    async register(req: Request, res: Response) {
      res.status(201).json(await service.register(req.body));
    },

    async login(req: Request, res: Response) {
      res.status(200).json(await service.login(req.body));
    },
  };
}
