import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../config.js';
import { UnauthorizedError } from '../../errors.js';
import { signToken, verifyToken } from '../token.js';

const config = loadConfig();

describe('token', () => {
  it('verifies a signed token and returns the same sub and role', () => {
    const token = signToken({ sub: 'user-1', role: 'ADMIN' }, config);

    const payload = verifyToken(token, config);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('ADMIN');
  });

  it('rejects a token signed with a different secret', () => {
    const token = signToken({ sub: 'user-1', role: 'USER' }, { ...config, JWT_SECRET: 'other' });

    expect(() => verifyToken(token, config)).toThrow(UnauthorizedError);
  });

  it('rejects an expired token', () => {
    const token = jwt.sign({ sub: 'user-1', role: 'USER' }, config.JWT_SECRET, {
      expiresIn: -10,
    });

    expect(() => verifyToken(token, config)).toThrow(UnauthorizedError);
  });

  it('rejects a garbage string', () => {
    expect(() => verifyToken('not-a-jwt', config)).toThrow(UnauthorizedError);
  });
});
