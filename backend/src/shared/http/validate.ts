import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import { ValidationError } from '../errors.js';

/**
 * Parses req.body or req.query with a Zod schema.
 * A parsed query goes to res.locals.query, because Express 5 makes req.query read-only.
 */
export function validate(schema: z.ZodType, source: 'body' | 'query') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || source}: ${issue.message}`)
        .join('; ');
      next(new ValidationError(message));
      return;
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      res.locals.query = result.data;
    }
    next();
  };
}
