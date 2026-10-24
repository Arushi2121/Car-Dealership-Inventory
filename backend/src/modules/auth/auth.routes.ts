import { Router } from 'express';
import { validate } from '../../shared/http/validate.js';
import { createAuthController } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';

export function authRouter(service: AuthService): Router {
  const controller = createAuthController(service);
  const router = Router();

  router.post('/register', validate(registerSchema, 'body'), controller.register);
  router.post('/login', validate(loginSchema, 'body'), controller.login);

  return router;
}
