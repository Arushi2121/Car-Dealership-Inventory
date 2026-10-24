import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type TokenPayload } from '../auth/token.js';
import type { Config } from '../config.js';
import { UnauthorizedError } from '../errors.js';

export function authenticate(config: Config) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new UnauthorizedError('Missing bearer token'));
      return;
    }

    let payload: TokenPayload;
    try {
      payload = verifyToken(header.slice('Bearer '.length), config);
    } catch (err) {
      next(err);
      return;
    }

    req.user = { id: payload.sub, role: payload.role };
    next();
  };
}
