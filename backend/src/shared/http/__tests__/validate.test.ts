import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ValidationError } from '../../errors.js';
import { validate } from '../validate.js';

const bodySchema = z.object({ name: z.string().trim().min(1) });
const querySchema = z.object({ make: z.string().trim(), minPrice: z.coerce.number() });

describe('validate', () => {
  it('replaces req.body with the parsed value and continues', () => {
    const req = { body: { name: '  Ada  ' } };
    const next = vi.fn();

    validate(bodySchema, 'body')(req as Request, {} as Response, next as NextFunction);

    expect(req.body).toEqual({ name: 'Ada' });
    expect(next).toHaveBeenCalledWith();
  });

  it('passes a ValidationError naming the failing field to next', () => {
    const req = { body: { name: 42 } };
    const next = vi.fn();

    validate(bodySchema, 'body')(req as Request, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(next.mock.calls[0][0].message).toContain('name');
  });

  it('stores a parsed query on res.locals.query and leaves req.query alone', () => {
    const query = { make: '  Toyota ', minPrice: '1000' };
    const req = { query };
    const res = { locals: {} as Record<string, unknown> };
    const next = vi.fn();

    validate(querySchema, 'query')(req as unknown as Request, res as Response, next as NextFunction);

    expect(res.locals.query).toEqual({ make: 'Toyota', minPrice: 1000 });
    expect(req.query).toBe(query);
    expect(req.query).toEqual({ make: '  Toyota ', minPrice: '1000' });
    expect(next).toHaveBeenCalledWith();
  });
});
