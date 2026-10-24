import { http, HttpResponse } from 'msw';
import { server } from '../../../test/server';
import { ApiError, apiFetch, setUnauthorizedHandler } from '../api';
import { setToken } from '../tokenStore';

const API_URL = import.meta.env.VITE_API_URL;

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the request to reject');
}

afterEach(() => {
  localStorage.clear();
  setUnauthorizedHandler(() => {});
});

describe('apiFetch', () => {
  it('sends the stored token as a Bearer Authorization header', async () => {
    let authorization: string | null = null;
    server.use(
      http.get(`${API_URL}/api/vehicles`, ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json([]);
      }),
    );
    setToken('stored-token');

    await apiFetch('/api/vehicles');

    expect(authorization).toBe('Bearer stored-token');
  });

  it('sends no Authorization header when there is no token', async () => {
    let hasAuthorization = true;
    server.use(
      http.get(`${API_URL}/api/vehicles`, ({ request }) => {
        hasAuthorization = request.headers.has('Authorization');
        return HttpResponse.json([]);
      }),
    );

    await apiFetch('/api/vehicles');

    expect(hasAuthorization).toBe(false);
  });

  it('sends a POST body as JSON', async () => {
    let contentType: string | null = null;
    let body: unknown = null;
    server.use(
      http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
        contentType = request.headers.get('Content-Type');
        body = await request.json();
        return HttpResponse.json({ token: 't' });
      }),
    );

    await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', password: 'secret123' },
    });

    expect(contentType).toBe('application/json');
    expect(body).toEqual({ email: 'a@b.com', password: 'secret123' });
  });

  it('resolves a 200 JSON response to the parsed body', async () => {
    server.use(
      http.get(`${API_URL}/api/vehicles`, () => HttpResponse.json([{ id: '1', make: 'Honda' }])),
    );

    await expect(apiFetch('/api/vehicles')).resolves.toEqual([{ id: '1', make: 'Honda' }]);
  });

  it('resolves a 204 response to undefined', async () => {
    server.use(
      http.delete(`${API_URL}/api/vehicles/1`, () => new HttpResponse(null, { status: 204 })),
    );

    await expect(apiFetch('/api/vehicles/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('rejects an error response with an ApiError carrying the status, code and message', async () => {
    server.use(
      http.post(`${API_URL}/api/vehicles/1/purchase`, () =>
        HttpResponse.json(
          { error: { code: 'OUT_OF_STOCK', message: 'Not enough stock' } },
          { status: 409 },
        ),
      ),
    );

    const error = await catchError(apiFetch('/api/vehicles/1/purchase', { method: 'POST' }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: 'OUT_OF_STOCK', message: 'Not enough stock' });
  });

  it('calls the unauthorized handler once on a 401 and still rejects', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    server.use(
      http.get(`${API_URL}/api/vehicles`, () =>
        HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
          { status: 401 },
        ),
      ),
    );

    const error = await catchError(apiFetch('/api/vehicles'));

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401 });
  });

  it('rejects a network failure with a NETWORK_ERROR ApiError', async () => {
    server.use(http.get(`${API_URL}/api/vehicles`, () => HttpResponse.error()));

    const error = await catchError(apiFetch('/api/vehicles'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Could not reach the server',
    });
  });
});
