import { useAuth } from '../features/auth';
import { Button } from '../shared/ui';
import { SiteHeader } from './layouts/SiteHeader';

/** Temporary page behind RequireAuth; Block 8 replaces it with the real showroom. */
export function ShowroomPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-4 px-6 py-16">
        <h1 className="text-5xl">Showroom</h1>
        <p className="text-muted">Signed in as {user?.email}</p>
        <Button variant="ghost" onClick={logout}>
          Log out
        </Button>
      </main>
    </>
  );
}
