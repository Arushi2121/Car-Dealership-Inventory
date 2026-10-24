import jwt from 'jsonwebtoken';
import type { Config } from '../config.js';
import { UnauthorizedError } from '../errors.js';

export type TokenPayload = {
  sub: string;
  role: 'USER' | 'ADMIN';
};

export function signToken(payload: TokenPayload, config: Config): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string, config: Config): TokenPayload {
  try {
    const { sub, role } = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    return { sub, role };
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
