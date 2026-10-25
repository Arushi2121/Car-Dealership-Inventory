import { getToken } from './tokenStore';

const API_URL = import.meta.env.VITE_API_URL;

/** An API failure in the backend's error shape. Status 0 means the server was unreachable. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type ApiOptions = {
  method?: string;
  body?: unknown;
};

let onUnauthorized: () => void = () => {};

/** Registers the function called whenever the API answers 401 (e.g. to log the user out). */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

/**
 * Calls the backend with the stored token and a JSON body, if any.
 * Resolves to the parsed JSON (undefined for 204) or rejects with an ApiError.
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const hasBody = options.body !== undefined;
  if (hasBody) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server');
  }

  if (response.status === 401) onUnauthorized();
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const { error } = await response.json();
    if (typeof error?.code === 'string' && typeof error?.message === 'string') {
      return new ApiError(response.status, error.code, error.message);
    }
  } catch {
    // Not JSON; fall through to the generic error.
  }
  return new ApiError(response.status, 'UNKNOWN_ERROR', 'Something went wrong');
}
