import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ApiError } from '../../shared/lib/api';
import { Button, Input } from '../../shared/ui';
import { AuthLayout } from './AuthLayout';
import { useAuth } from './AuthProvider';
import { safeNext } from './safeNext';

const demoAccounts = {
  customer: {
    email: import.meta.env.VITE_DEMO_USER_EMAIL ?? '',
    password: import.meta.env.VITE_DEMO_USER_PASSWORD ?? '',
  },
  admin: {
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL ?? '',
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD ?? '',
  },
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(safeNext(searchParams.get('next')), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  function fillDemo(account: keyof typeof demoAccounts) {
    setEmail(demoAccounts[account].email);
    setPassword(demoAccounts[account].password);
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Sign in to browse the showroom.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or try a demo account
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="ghost" onClick={() => fillDemo('customer')}>
          Try as customer
        </Button>
        <Button type="button" variant="ghost" onClick={() => fillDemo('admin')}>
          Try as admin
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
