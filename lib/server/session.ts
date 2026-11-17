import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_AGE, SESSION_COOKIE, safeEqual, sessionSecret, signToken, verifyToken } from './token';

function secret(): string {
  const s = sessionSecret();
  if (!s) throw new Error('SESSION_SECRET must be set (32+ characters)');
  return s;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD;
  return !!expected && safeEqual(password, expected);
}

export async function signIn() {
  (await cookies()).set(SESSION_COOKIE, signToken(SESSION_AGE, secret()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_AGE,
  });
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isSignedIn(): Promise<boolean> {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value, secret());
}

/** Call at the top of every protected layout, route handler and server action. */
export async function requireUser(): Promise<void> {
  if (!(await isSignedIn())) redirect('/login');
}
