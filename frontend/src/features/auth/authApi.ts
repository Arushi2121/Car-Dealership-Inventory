import { apiFetch } from '../../shared/lib/api';
import type { Session } from './session';

export type Credentials = {
  email: string;
  password: string;
};

export type Registration = Credentials & {
  name?: string;
};

export function login(credentials: Credentials): Promise<Session> {
  return apiFetch<Session>('/api/auth/login', { method: 'POST', body: credentials });
}

export function register(registration: Registration): Promise<Session> {
  return apiFetch<Session>('/api/auth/register', { method: 'POST', body: registration });
}
