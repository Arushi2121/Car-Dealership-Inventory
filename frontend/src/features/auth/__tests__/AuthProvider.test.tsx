import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { apiFetch } from '../../../shared/lib/api';
import { makeSession } from '../../../test/fakeSession';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/server';
import { useAuth } from '../AuthProvider';
import { loadSession, saveSession } from '../session';

const API_URL = import.meta.env.VITE_API_URL;

function AuthProbe() {
  const { user, logout } = useAuth();
  return (
    <div>
      <p>{user ? user.email : 'Signed out'}</p>
      <button onClick={logout}>Log out</button>
      <button onClick={() => apiFetch('/api/vehicles').catch(() => {})}>Load vehicles</button>
    </div>
  );
}

afterEach(() => localStorage.clear());

describe('AuthProvider', () => {
  it('logout clears the session and the user', async () => {
    saveSession(makeSession());
    renderWithProviders(<AuthProbe />);
    expect(screen.getByText('driver@marque.test')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(loadSession()).toBeNull();
  });

  it('logs out when any API call returns 401', async () => {
    server.use(
      http.get(`${API_URL}/api/vehicles`, () =>
        HttpResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Token expired' } },
          { status: 401 },
        ),
      ),
    );
    saveSession(makeSession());
    renderWithProviders(<AuthProbe />);

    await userEvent.click(screen.getByRole('button', { name: 'Load vehicles' }));

    expect(await screen.findByText('Signed out')).toBeInTheDocument();
    expect(loadSession()).toBeNull();
  });
});
