import { Link } from 'react-router';
import { useAuth } from '../../features/auth';
import { Badge, Button } from '../../shared/ui';

/** Header for signed-in pages: who you are and a way out. */
export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link to="/" className="font-display text-2xl font-semibold text-ink">
          Marque
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <Badge>{user.role === 'ADMIN' ? 'Admin' : 'Customer'}</Badge>
            <Button variant="ghost" onClick={logout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
