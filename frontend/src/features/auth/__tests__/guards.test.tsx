import { screen } from '@testing-library/react';
import { makeSession } from '../../../test/fakeSession';
import { LocationDisplay } from '../../../test/LocationDisplay';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { RequireAdmin } from '../RequireAdmin';
import { RequireAuth } from '../RequireAuth';
import { saveSession } from '../session';

afterEach(() => localStorage.clear());

describe('RequireAuth', () => {
  it('sends a signed-out visitor to login, remembering where they were going', async () => {
    renderWithProviders(
      <RequireAuth>
        <p>Secret</p>
      </RequireAuth>,
      {
        initialEntries: ['/showroom'],
        routes: [{ path: '/login', element: <LocationDisplay /> }],
      },
    );

    expect(await screen.findByText('/login?next=%2Fshowroom')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders its children for a signed-in user', () => {
    saveSession(makeSession('USER'));

    renderWithProviders(
      <RequireAuth>
        <p>Secret</p>
      </RequireAuth>,
      { initialEntries: ['/showroom'] },
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

describe('RequireAdmin', () => {
  it('shows "Admins only" to a regular user', () => {
    saveSession(makeSession('USER'));

    renderWithProviders(
      <RequireAdmin>
        <p>Secret</p>
      </RequireAdmin>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('Admins only')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders its children for an admin', () => {
    saveSession(makeSession('ADMIN'));

    renderWithProviders(
      <RequireAdmin>
        <p>Secret</p>
      </RequireAdmin>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});
