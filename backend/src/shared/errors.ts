/**
 * Base class for expected failures. Services throw these without knowing about HTTP;
 * errorHandler maps `status` and `code` to the response.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(400, code, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code = 'UNAUTHORIZED') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code = 'FORBIDDEN') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(409, code, message);
  }
}
