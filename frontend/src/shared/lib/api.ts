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

const SLOW_START_AFTER_MS = 4000;

let onUnauthorized: () => void = () => {};
let slowRequests = 0;
let onSlowStart: (waiting: boolean) => void = () => {};

/** Registers the function called whenever the API answers 401 (e.g. to log the user out). */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

/**
 * Called with true when a request is still in flight after 4 seconds,
 * and with false when the last such request has settled.
 * Render's free tier sleeps; the app uses this for a non-blocking banner.
 */
export function setSlowStartHandler(handler: (waiting: boolean) => void): void {
  onSlowStart = handler;
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

  // Overlapping requests share one banner, hidden only when the last slow one settles.
  let slow = false;
  const timer = setTimeout(() => {
    slow = true;
    slowRequests += 1;
    if (slowRequests === 1) onSlowStart(true);
  }, SLOW_START_AFTER_MS);

  try {
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
  } finally {
    clearTimeout(timer);
    if (slow) {
      slowRequests -= 1;
      if (slowRequests === 0) onSlowStart(false);
    }
  }
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
