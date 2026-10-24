import type { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictError, NotFoundError } from '../../errors.js';
import { errorHandler } from '../errorHandler.js';

function mockResponse(headersSent = false) {
  const res = { headersSent, status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  const req = {} as Request;
  let next: ReturnType<typeof vi.fn>;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    next = vi.fn();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  function handle(err: unknown, res = mockResponse()) {
    errorHandler(err, req, res as unknown as Response, next as unknown as NextFunction);
    return res;
  }

  it('maps a NotFoundError to 404 with its code and message', () => {
    const res = handle(new NotFoundError('Vehicle not found'));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Vehicle not found' },
    });
  });

  it('maps a ConflictError to 409 and keeps its custom code', () => {
    const res = handle(new ConflictError('Not enough stock', 'OUT_OF_STOCK'));

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].error.code).toBe('OUT_OF_STOCK');
  });

  it('hides the details of an unknown error behind a generic 500 and logs it', () => {
    const res = handle(new Error('db password leaked'));

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).not.toContain('db password leaked');
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('delegates to next when headers were already sent', () => {
    const err = new Error('stream broke');
    const res = handle(err, mockResponse(true));

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });
});
