import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isSignedIn } from '@/lib/server/session';
import { sessionSecret } from '@/lib/server/token';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (sessionSecret() && (await isSignedIn())) redirect('/');
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="relative grid h-12 w-12 place-items-center rounded-full text-[15px] font-extrabold tracking-tight text-white shadow-[0_6px_16px_-8px_rgba(31,58,147,0.8)]" style={{ background: 'var(--hero)' }}>
            PhD<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" aria-hidden />
          </span>
          <div>
            <h1 className="text-[26px] font-extrabold leading-none tracking-tight">PhD Tracker</h1>
            <p className="mt-1 text-sm text-ink-3">Fall 2027 applications</p>
          </div>
        </div>
        <LoginForm next={next ?? '/'} />
      </div>
    </main>
  );
}
