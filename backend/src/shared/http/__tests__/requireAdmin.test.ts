import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { ForbiddenError, UnauthorizedError } from '../../errors.js';
import { requireAdmin } from '../requireAdmin.js';

function run(user?: { id: string; role: 'USER' | 'ADMIN' }) {
  const req = { user };
  const next = vi.fn();
  requireAdmin(req as unknown as Request, {} as Response, next as NextFunction);
  return next;
}

describe('requireAdmin', () => {
  it('rejects a request with no authenticated user', () => {
    expect(run()).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('forbids a USER', () => {
    expect(run({ id: 'user-1', role: 'USER' })).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('lets an ADMIN through', () => {
    expect(run({ id: 'admin-1', role: 'ADMIN' })).toHaveBeenCalledWith();
  });
});
