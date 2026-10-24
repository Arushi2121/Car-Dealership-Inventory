import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors.js';

function isJsonParseError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    err.type === 'entity.parse.failed'
  );
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (isJsonParseError(err)) {
    res
      .status(400)
      .json({ error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' } });
    return;
  }

  // Unknown errors may carry internals (SQL, secrets), so log them and send a generic message.
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
}
