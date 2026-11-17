'use client';

import { CalendarPlus, Copy, Download } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useApp } from '@/lib/store';

const subscribeNoop = () => () => {};

export default function CalendarLinks() {
  const key = useApp(s => s.feedKey);
  const notify = useApp(s => s.notify);
  const host = useSyncExternalStore(subscribeNoop, () => window.location.host, () => '');
  const feed = `${host}/api/calendar?key=${key}`;
  return (
    <div className="flex flex-wrap gap-2">
      <a className="btn btn-primary" href={host ? `webcal://${feed}` : undefined}><CalendarPlus size={18} aria-hidden /> Subscribe in Calendar</a>
      <a className="btn" href="/api/calendar" download><Download size={18} aria-hidden /> Download .ics</a>
      <button className="btn btn-quiet" onClick={async () => {
        try { await navigator.clipboard.writeText(`https://${feed}`); notify('Calendar link copied'); } catch { notify('Could not copy the link', true); }
      }}><Copy size={18} aria-hidden /> Copy link</button>
    </div>
  );
}
