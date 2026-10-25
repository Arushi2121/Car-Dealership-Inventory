import { useEffect, useState } from 'react';
import { setSlowStartHandler } from '../shared/lib/api';

/**
 * Render's free tier sleeps when idle, and the first request can take up to a minute.
 * This sits over the page without blocking clicks, and hides when the request settles.
 */
export function SlowStartBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setSlowStartHandler(setVisible);
    return () => setSlowStartHandler(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
      <p
        role="status"
        className="max-w-sm rounded-pill bg-night px-5 py-2 text-center text-sm text-night-fg"
      >
        Waking up the server, this can take up to a minute on the free tier.
      </p>
    </div>
  );
}
