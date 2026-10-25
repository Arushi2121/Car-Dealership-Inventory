import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

const TOAST_MS = 4000;

type Toast = { id: number; message: string };

const ToastContext = createContext<((message: string) => void) | null>(null);

let nextId = 0;

/** Short confirmations, announced politely and dismissed on their own. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = nextId++;
    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-6"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className="rounded-pill bg-night px-5 py-2.5 text-sm text-night-fg motion-safe:animate-rise-in"
          >
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (message: string) => void {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error('useToast must be used inside a ToastProvider');
  return showToast;
}
