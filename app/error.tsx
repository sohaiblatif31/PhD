'use client';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="page-title">The tracker could not load</h1>
      <p className="mt-3 text-ink-2">The database did not answer, or the server is missing its settings.</p>
      <p className="mt-2 text-sm text-ink-3">If the Supabase project is paused, restore it in the Supabase dashboard, then try again.</p>
      {error.digest && <p className="mt-2 text-xs text-ink-3">Reference: {error.digest}</p>}
      <button className="btn btn-primary mt-6" onClick={reset}>Try again</button>
    </div>
  );
}
