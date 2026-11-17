'use client';

import { format, parseISO } from 'date-fns';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Chip, Progress } from '@/components/ui';
import { addDaysISO, formatDate } from '@/lib/dates';
import { useApp, useData } from '@/lib/store';
import { deadlines, lettersOutstanding, outreachStage, staleRecords, type Deadline } from '@/lib/today';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export default function TodayPage() {
  const data = useData();
  const today = useApp(s => s.today);
  const update = useApp(s => s.update);
  const [showAll, setShowAll] = useState(false);

  const dl = useMemo(() => deadlines(data, today), [data, today]);
  const stale = useMemo(() => staleRecords(data, today), [data, today]);
  const letters = useMemo(() => lettersOutstanding(data, today), [data, today]);
  const followUps = data.supervisors.filter(s => outreachStage(s, today) === 'Follow up');

  // Older misses are usually last cycle's date; they stay on the program and calendar pages.
  const overdue = dl.filter(d => d.days < 0 && d.days >= -30);
  const upcoming = dl.filter(d => d.days >= 0);
  const next = upcoming[0];
  const soon = upcoming.filter(d => d.days <= 45);
  const atRisk = upcoming.filter(d => d.atRisk);
  const shown = showAll ? [...overdue, ...upcoming] : [...overdue, ...upcoming.slice(0, 8)];

  const headline = next
    ? next.days === 0 ? `${next.title} closes today.` : `${next.title} closes in ${plural(next.days, 'day')}.`
    : 'No deadlines ahead.';
  const lede = [
    soon.length > 1 && `${plural(soon.length - 1, 'more deadline')} in the next 45 days`,
    overdue.length && `${overdue.length} past due`,
    atRisk.length && `${atRisk.length} at risk`,
    followUps.length && plural(followUps.length, 'follow-up') + ' due',
  ].filter(Boolean).join(', ');

  const verify = (kind: 'program' | 'scholarship', id: string) =>
    update(kind === 'program' ? 'programs' : 'scholarships', id, { lastVerified: today }, 'Marked as verified today');

  const pipeline = (['Submitted', 'Interview', 'Offer Received', 'Accepted'] as const).map(s => ({ s, n: data.programs.filter(p => p.status === s).length }));

  return (
    <div>
      <header className="mb-8 max-w-3xl md:mb-10">
        <p className="text-[15px] font-medium text-ink-3">{format(parseISO(today), 'EEEE, MMMM d')}</p>
        <h1 className="page-title mt-1">{headline}</h1>
        {lede && <p className="mt-3 text-[17px] text-ink-2">{lede[0].toUpperCase() + lede.slice(1)}.</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <section aria-labelledby="deadlines" className="panel min-w-0 px-3 py-2 md:px-5">
          <div className="flex items-baseline justify-between px-1 pb-1 pt-3">
            <h2 id="deadlines" className="section-title">Deadlines</h2>
            <Link href="/calendar" className="text-sm font-semibold text-accent">Calendar</Link>
          </div>
          {shown.length === 0 && <p className="px-1 py-8 text-ink-3">Nothing open with a fixed date. Add deadline dates on each program to see them here.</p>}
          <ol>
            {shown.map(d => <LedgerRow key={`${d.kind}-${d.id}`} d={d} />)}
          </ol>
          {overdue.length + upcoming.length > shown.length && (
            <button className="btn btn-quiet my-2 w-full" onClick={() => setShowAll(true)}>Show all {overdue.length + upcoming.length}</button>
          )}
        </section>

        <aside className="flex min-w-0 flex-col gap-6">
          {followUps.length > 0 && (
            <section className="panel p-4" aria-labelledby="fu">
              <h2 id="fu" className="section-title mb-2">Follow-ups due</h2>
              <ul>
                {followUps.slice(0, 5).map(s => (
                  <li key={s.id} className="flex items-center gap-3 border-t border-line py-2 first:border-0">
                    <Link href={`/supervisors?q=${encodeURIComponent(s.name)}`} className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{s.name}</span>
                      <span className="block truncate text-[13px] text-ink-3">{s.university}</span>
                    </Link>
                    <button className="btn btn-sm" onClick={() => update('supervisors', s.id, { followUpAt: addDaysISO(today, 10) }, 'Follow-up logged. Next check in 10 days')}>Sent</button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {letters.length > 0 && (
            <section className="panel p-4" aria-labelledby="letters">
              <h2 id="letters" className="section-title mb-2">Letters outstanding</h2>
              <ul>
                {letters.slice(0, 5).map(l => (
                  <li key={`${l.refereeId}-${l.programId}`} className="border-t border-line py-2 first:border-0">
                    <Link href="/referees" className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{l.referee}</span>
                        <span className="block truncate text-[13px] text-ink-3">for {l.program}</span>
                      </span>
                      {l.days !== null && <span className={`num shrink-0 text-sm font-semibold ${l.days <= 14 ? 'late' : 'text-ink-2'}`}>{l.days < 0 ? 'late' : `${l.days}d`}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="panel p-4" aria-labelledby="recheck">
            <h2 id="recheck" className="section-title">Re-check against the source</h2>
            <p className="mt-1 text-[13px] text-ink-3">Never verified, or last checked more than 60 days ago. Deadlines move each cycle.</p>
            {stale.length === 0 ? (
              <p className="mt-3 text-sm text-moss">Everything open was verified recently.</p>
            ) : (
              <ul className="mt-2">
                {stale.slice(0, 6).map(r => (
                  <li key={r.id} className="flex items-center gap-2 border-t border-line py-1.5 first:border-0">
                    <Link href={r.href} className="min-w-0 flex-1 py-1">
                      <span className="block truncate text-[14px] font-medium">{r.title}</span>
                      <span className="text-[12px]"><span className="marker">{r.age === null ? 'never verified' : `checked ${r.age} days ago`}</span></span>
                    </Link>
                    <button className="icon-btn" aria-label={`Mark ${r.title} verified today`} title="I checked it today" onClick={() => verify(r.kind, r.id)}>
                      <Check size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {stale.length > 6 && <Link href="/programs?filter=recheck" className="mt-2 block text-sm font-semibold text-accent">{stale.length - 6} more to re-check</Link>}
          </section>

          <section className="panel p-4" aria-labelledby="pipe">
            <h2 id="pipe" className="section-title mb-3">After submission</h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              {pipeline.map(({ s, n }) => (
                <Link key={s} href="/tracker" className="rounded-[10px] bg-surface-2 px-1 py-2">
                  <span className="num block font-serif text-[28px] leading-none">{n}</span>
                  <span className="mt-1 block text-[11px] leading-tight text-ink-3">{s === 'Offer Received' ? 'Offers' : s}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function LedgerRow({ d }: { d: Deadline }) {
  const late = d.days < 0;
  return (
    <li>
      <Link href={d.href} className="ledger-row group">
        <span className={`ledger-days ${late || d.days <= 14 ? 'late' : ''}`}>
          {Math.abs(d.days)}
          <span className="ledger-unit">{late ? (d.days === -1 ? 'day late' : 'days late') : d.days === 0 ? 'today' : d.days === 1 ? 'day' : 'days'}</span>
        </span>
        <span className="min-w-0 pt-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[16px] font-semibold group-hover:text-accent">{d.title}</span>
            {d.kind === 'scholarship' && <Chip tone="moss">Funding</Chip>}
            {d.atRisk && <Chip tone="red">At risk</Chip>}
            {d.priority === 'High' && d.kind === 'program' && <Chip tone="neutral">High priority</Chip>}
          </span>
          <span className="mt-0.5 block truncate text-[14px] text-ink-2">{d.subtitle}</span>
          <span className="mt-1 block text-[13px] text-ink-3">
            {formatDate(d.date)}{d.nextItem && <span className="ml-3">Next: {d.nextItem}</span>}
          </span>
          {d.pct !== undefined && (
            <span className="mt-2 flex items-center gap-3">
              <span className="flex-1"><Progress pct={d.pct} label={`${d.title} documents`} /></span>
              <span className="num w-10 text-right text-[12px] text-ink-3">{d.pct}%</span>
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
