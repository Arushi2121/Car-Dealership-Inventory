import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { makeSession } from '../../../test/fakeSession';
import { LocationDisplay } from '../../../test/LocationDisplay';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/server';
import { LoginPage } from '../LoginPage';

const API_URL = import.meta.env.VITE_API_URL;

function respondWithSession() {
  const session = makeSession();
  return HttpResponse.json({ user: session.user, token: session.token });
}

function renderLogin(initialEntry = '/login') {
  return renderWithProviders(
    <>
      <LoginPage />
      <LocationDisplay />
    </>,
    {
      initialEntries: [initialEntry],
      routes: [{ path: '/showroom', element: <LocationDisplay /> }],
    },
  );
}

async function signIn(email = 'driver@marque.test', password = 'secret123') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole('button', { name: /^sign in$/i }));
}

afterEach(() => localStorage.clear());

describe('LoginPage', () => {
  it('posts the credentials and goes to the showroom', async () => {
    let body: unknown = null;
    server.use(
      http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
        body = await request.json();
        return respondWithSession();
      }),
    );
    renderWithProviders(<LoginPage />, {
      initialEntries: ['/login'],
      routes: [{ path: '/showroom', element: <p>Showroom</p> }],
    });

    await signIn('driver@marque.test', 'secret123');

    expect(await screen.findByText('Showroom')).toBeInTheDocument();
    expect(body).toEqual({ email: 'driver@marque.test', password: 'secret123' });
  });

  it('shows the API error and stays on the login page', async () => {
    server.use(
      http.post(`${API_URL}/api/auth/login`, () =>
        HttpResponse.json(
          { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
          { status: 401 },
        ),
      ),
    );
    renderLogin();

    await signIn();

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/login$/);
  });

  it('marks the submit button busy while the request is pending', async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.post(`${API_URL}/api/auth/login`, async () => {
        await pending;
        return respondWithSession();
      }),
    );
    renderLogin();

    await signIn();

    expect(screen.getByRole('button', { name: /^sign in$/i })).toHaveAttribute('aria-busy', 'true');
    release();
    expect(await screen.findByText(/^\/showroom$/)).toBeInTheDocument();
  });

  it('fills the demo customer credentials', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Try as customer' }));

    expect(screen.getByLabelText(/email/i)).toHaveValue(import.meta.env.VITE_DEMO_USER_EMAIL);
    expect(screen.getByLabelText(/password/i)).toHaveValue(import.meta.env.VITE_DEMO_USER_PASSWORD);
  });

  it('fills the demo admin credentials', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: 'Try as admin' }));

    expect(screen.getByLabelText(/email/i)).toHaveValue(import.meta.env.VITE_DEMO_ADMIN_EMAIL);
    expect(screen.getByLabelText(/password/i)).toHaveValue(
      import.meta.env.VITE_DEMO_ADMIN_PASSWORD,
    );
  });

  it('returns to the page in ?next after signing in', async () => {
    server.use(http.post(`${API_URL}/api/auth/login`, respondWithSession));
    renderLogin('/login?next=%2Fshowroom%3Fcategory%3DSUV');

    await signIn();

    expect(await screen.findByText('/showroom?category=SUV')).toBeInTheDocument();
  });

  it.each(['https://evil.example', '//evil.example'])(
    'ignores an unsafe next value (%s) and goes to the showroom',
    async (next) => {
      server.use(http.post(`${API_URL}/api/auth/login`, respondWithSession));
      renderLogin(`/login?next=${encodeURIComponent(next)}`);

      await signIn();

      expect(await screen.findByText(/^\/showroom$/)).toBeInTheDocument();
    },
  );
});
