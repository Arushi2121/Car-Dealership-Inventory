import { Link } from 'react-router';
import { buttonClasses } from '../shared/ui';
import { SiteHeader } from './layouts/SiteHeader';

export function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-xl gap-6 px-6 py-32 text-center">
        <p className="text-sm font-medium text-muted">404</p>
        <h1 className="text-5xl">This road doesn't go anywhere.</h1>
        <p className="text-muted">The page you asked for doesn't exist.</p>
        <Link to="/" className={`justify-self-center ${buttonClasses('dark')}`}>
          Back home
        </Link>
      </main>
    </>
  );
}
