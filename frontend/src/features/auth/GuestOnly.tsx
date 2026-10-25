import type { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { useAuth } from './AuthProvider';
import { safeNext } from './safeNext';

/** Login and register are for signed-out visitors; signed-in users go where ?next points. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  if (user) return <Navigate to={safeNext(searchParams.get('next'))} replace />;
  return children;
}
