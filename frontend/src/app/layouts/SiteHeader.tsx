import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../features/auth';
import { buttonClasses } from '../../shared/ui';

const navLinkClasses = 'text-sm font-medium text-ink hover:text-ink/70';

/** `overlay` floats the header over the page, for pages whose top padding already clears it. */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const background = scrolled
    ? 'bg-canvas/80 backdrop-blur border-b border-line'
    : overlay
      ? 'bg-canvas/80 backdrop-blur'
      : 'bg-canvas';

  const links = (
    <>
      <Link to="/showroom" className={navLinkClasses}>
        Showroom
      </Link>
      {user ? (
        <>
          <span className="text-sm text-muted">{user.email}</span>
          <button type="button" onClick={logout} className={`text-left ${navLinkClasses}`}>
            Log out
          </button>
        </>
      ) : (
        <Link to="/login" className={navLinkClasses}>
          Sign in
        </Link>
      )}
      <Link to="/showroom" className={buttonClasses('primary')}>
        Browse cars
      </Link>
    </>
  );

  return (
    <header
      className={`${overlay ? 'fixed' : 'sticky'} inset-x-0 top-0 z-50 transition-colors duration-200 ${background}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="font-display text-2xl font-semibold text-ink">
          Marque
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {links}
        </nav>
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className={`md:hidden ${buttonClasses('ghost')}`}
        >
          Menu
        </button>
      </div>
      {menuOpen && (
        <nav
          id="site-menu"
          aria-label="Main"
          className="flex flex-col gap-4 border-t border-line bg-canvas px-6 py-5 md:hidden"
        >
          {links}
        </nav>
      )}
    </header>
  );
}
