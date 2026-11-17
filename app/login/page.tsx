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
          <span className="grid h-12 w-12 place-items-center rounded-[12px] bg-[#17213a] font-serif text-[17px] ring-1 ring-inset ring-white/15 font-semibold text-[#f4f5f1]">PhD</span>
          <div>
            <h1 className="font-serif text-[26px] font-semibold leading-none">PhD Tracker</h1>
            <p className="mt-1 text-sm text-ink-3">Fall 2027 applications</p>
          </div>
        </div>
        <LoginForm next={next ?? '/'} />
      </div>
    </main>
  );
}
