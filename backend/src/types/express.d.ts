declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` once the bearer token is verified. */
      user?: { id: string; role: 'USER' | 'ADMIN' };
    }
  }
}

export {};
