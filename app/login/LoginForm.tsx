'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions';

export default function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="panel lift p-5">
      <input type="hidden" name="next" value={next} />
      {/* username field lets iCloud Keychain save and fill the password */}
      <input type="text" name="username" autoComplete="username" value="phd-tracker" readOnly hidden />
      <label className="label" htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus className="field"
        aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} />
      {error && <p id="login-error" className="mt-2 text-sm text-red" role="alert">{error}</p>}
      <button className="btn btn-primary mt-4 w-full" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
