import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { makeSession } from '../../../test/fakeSession';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/server';
import { RegisterPage } from '../RegisterPage';

const API_URL = import.meta.env.VITE_API_URL;

function renderRegister() {
  return renderWithProviders(<RegisterPage />, {
    initialEntries: ['/register'],
    routes: [{ path: '/showroom', element: <p>Showroom</p> }],
  });
}

async function fillAndSubmit(password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/name/i), 'Dana Driver');
  await user.type(screen.getByLabelText(/email/i), 'driver@marque.test');
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole('button', { name: /create account/i }));
}

afterEach(() => localStorage.clear());

describe('RegisterPage', () => {
  it('posts the new account and goes to the showroom', async () => {
    let body: unknown = null;
    server.use(
      http.post(`${API_URL}/api/auth/register`, async ({ request }) => {
        body = await request.json();
        const session = makeSession();
        return HttpResponse.json({ user: session.user, token: session.token }, { status: 201 });
      }),
    );
    renderRegister();

    await fillAndSubmit('secret123');

    expect(await screen.findByText('Showroom')).toBeInTheDocument();
    expect(body).toEqual({
      email: 'driver@marque.test',
      password: 'secret123',
      name: 'Dana Driver',
    });
  });

  it('rejects a short password inline without calling the API', async () => {
    const registerCalled = vi.fn();
    server.use(
      http.post(`${API_URL}/api/auth/register`, () => {
        registerCalled();
        return HttpResponse.json({}, { status: 201 });
      }),
    );
    renderRegister();

    await fillAndSubmit('short');

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(registerCalled).not.toHaveBeenCalled();
  });

  it('shows the API error when the email is taken', async () => {
    server.use(
      http.post(`${API_URL}/api/auth/register`, () =>
        HttpResponse.json(
          { error: { code: 'EMAIL_TAKEN', message: 'That email is already registered' } },
          { status: 409 },
        ),
      ),
    );
    renderRegister();

    await fillAndSubmit('secret123');

    expect(await screen.findByRole('alert')).toHaveTextContent('That email is already registered');
  });

  it('links to the login page', () => {
    renderRegister();

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });
});
