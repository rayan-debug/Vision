import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">404</p>
      <h1 className="font-display text-super mb-6">Lost in the layout.</h1>
      <p className="text-bone/60 mb-8 max-w-md">
        The page you’re looking for doesn’t exist — or hasn’t been published yet.
      </p>
      <Link
        href="/"
        className="px-8 py-4 border border-accent text-accent hover:bg-accent hover:text-ink transition-colors text-sm uppercase tracking-widest"
      >
        Take me home →
      </Link>
    </main>
  );
}
