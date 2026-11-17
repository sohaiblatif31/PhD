import { type NextRequest } from 'next/server';
import { todayIn } from '@/lib/dates';
import { buildICS } from '@/lib/ics';
import { loadAll } from '@/lib/server/db';
import { isSignedIn } from '@/lib/server/session';
import { feedKey, safeEqual, sessionSecret } from '@/lib/server/token';
import { deadlines } from '@/lib/today';

// Calendar apps cannot log in, so the subscription URL carries a key derived from SESSION_SECRET.
export async function GET(request: NextRequest) {
  const secret = sessionSecret();
  const key = request.nextUrl.searchParams.get('key');
  const allowed = secret && (key ? safeEqual(key, feedKey(secret)) : await isSignedIn());
  if (!allowed) return new Response('Not found', { status: 404 });

  const data = await loadAll();
  const origin = request.nextUrl.origin;
  const events = deadlines(data, todayIn('America/Toronto')).map(d => ({
    uid: `${d.id}@phd-tracker`,
    date: d.date,
    title: d.kind === 'program' ? `PhD deadline: ${d.title}` : `Funding deadline: ${d.title}`,
    description: d.kind === 'program' ? `${d.subtitle}\n${origin}${d.href}` : d.subtitle,
    url: `${origin}${d.href}`,
  }));
  return new Response(buildICS(events, new Date()), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `${key ? 'inline' : 'attachment'}; filename="phd-deadlines.ics"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
