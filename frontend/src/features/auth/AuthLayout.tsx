import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Card, HeroPhoto } from '../../shared/ui';

const wordmarkClasses = 'font-display text-2xl font-semibold text-ink';

/** Split screen: the hero photo on the left (md and up), the form card on the right. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden md:block">
        <HeroPhoto className="absolute inset-0" />
        <Link to="/" className={`absolute top-8 left-8 ${wordmarkClasses}`}>
          Marque
        </Link>
      </div>
      <main className="flex flex-col px-6 py-8">
        <Link to="/" className={`md:hidden ${wordmarkClasses}`}>
          Marque
        </Link>
        <Card className="m-auto w-full max-w-sm p-8">{children}</Card>
      </main>
    </div>
  );
}
