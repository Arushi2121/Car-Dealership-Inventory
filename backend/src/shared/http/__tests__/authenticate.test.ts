import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { signToken } from '../../auth/token.js';
import { loadConfig } from '../../config.js';
import { UnauthorizedError } from '../../errors.js';
import { authenticate } from '../authenticate.js';

const config = loadConfig();

function run(authorization?: string) {
  const req: { headers: Record<string, string>; user?: unknown } = {
    headers: authorization ? { authorization } : {},
  };
  const next = vi.fn();
  authenticate(config)(req as unknown as Request, {} as Response, next as NextFunction);
  return { req, next };
}

describe('authenticate', () => {
  it('rejects a request with no Authorization header', () => {
    const { next } = run();

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects a non-Bearer scheme', () => {
    const { next } = run('Basic abc');

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('rejects an invalid Bearer token', () => {
    const { next } = run('Bearer not-a-jwt');

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('sets req.user from a valid token and continues', () => {
    const token = signToken({ sub: 'user-1', role: 'USER' }, config);

    const { req, next } = run(`Bearer ${token}`);

    expect(req.user).toEqual({ id: 'user-1', role: 'USER' });
    expect(next).toHaveBeenCalledWith();
  });
});
