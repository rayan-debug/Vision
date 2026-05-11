'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Next 15 requires useSearchParams() to be inside a Suspense boundary so the
// outer route can be statically prerendered. The form below is the only thing
// that needs the search params, so we split it into a child component and
// wrap it in <Suspense>.
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={<LoginShell />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      headers: { 'Content-Type': 'application/json' },
    });
    setLoading(false);
    if (res.ok) {
      router.replace(next);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Login failed.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm bg-surface border border-ink/10 p-8">
      <Brand />
      <p className="text-xs uppercase tracking-widest text-muted mb-6">Admin</p>

      <label className="block mb-4">
        <span className="label">Email</span>
        <input name="email" type="email" required autoFocus className="input" />
      </label>
      <label className="block mb-6">
        <span className="label flex items-center justify-between">
          Password
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="text-[10px] text-muted hover:text-accent normal-case tracking-normal"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </span>
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          className="input"
        />
      </label>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-accent w-full justify-center">
        {loading ? 'Signing in…' : 'Sign in →'}
      </button>
    </form>
  );
}

// Static prerender fallback shown while the client takes over.
function LoginShell() {
  return (
    <div className="w-full max-w-sm bg-surface border border-ink/10 p-8">
      <Brand />
      <p className="text-xs uppercase tracking-widest text-muted mb-6">Admin</p>
      <div className="h-32 animate-pulse bg-surface-100" />
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 mb-1">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent">
        <path
          d="M3 13C8 12 11 9 12 4C13 9 16 12 21 13C16 14 13 17 12 22C11 17 8 14 3 13Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-display text-lg">The Vision</span>
    </div>
  );
}
