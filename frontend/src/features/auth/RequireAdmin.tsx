import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useAuth } from './AuthProvider';
import { RequireAuth } from './RequireAuth';

/** Signed-in admins see the children; other users see a notice. Real enforcement is server-side. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();

  return (
    <RequireAuth>
      {isAdmin ? (
        children
      ) : (
        <main className="grid min-h-screen place-content-center gap-4 px-6 text-center">
          <h1 className="text-4xl">Admins only</h1>
          <p className="text-muted">This page is for dealership staff.</p>
          <Link to="/showroom" className="font-medium text-ink underline underline-offset-4">
            Back to the showroom
          </Link>
        </main>
      )}
    </RequireAuth>
  );
}
