import { isGone } from './useAdminMutations';

/** The server's message for a failed save. A 404 is reported by a toast instead. */
export function FormError({ error }: { error: Error | null }) {
  if (!error || isGone(error)) return null;
  return (
    <p role="alert" className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
      {error.message}
    </p>
  );
}
