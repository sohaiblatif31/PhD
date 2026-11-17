'use client';

import { Check, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { Chip, Countdown, Empty, PageHeader, PillSelect } from '@/components/ui';
import { daysUntil, formatDate } from '@/lib/dates';
import { useApp } from '@/lib/store';
import { OPEN_PROGRAM, STALE_AFTER_DAYS } from '@/lib/today';
import type { EligibilityStatus, Scholarship, ScholarshipStatus } from '@/lib/types';
import { ELIGIBILITY_TONE, PROVINCE_NAMES, SCHOLARSHIP_STATUSES, STATUS_TONE, matches } from '@/lib/utils';

const VIEWS = {
  open: { label: 'Open to me', test: (s: Scholarship) => !s.discontinued && s.eligibleForMe !== 'No' && !['Awarded', 'Not Awarded'].includes(s.status) },
  all: { label: 'All current', test: (s: Scholarship) => !s.discontinued },
  done: { label: 'Applied or decided', test: (s: Scholarship) => ['Applied', 'Awarded', 'Not Awarded'].includes(s.status) },
  gone: { label: 'Discontinued', test: (s: Scholarship) => s.discontinued },
} as const;
type View = keyof typeof VIEWS;

export default function ScholarshipsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = use(searchParams);
  const scholarships = useApp(s => s.scholarships);
  const programs = useApp(s => s.programs);
  const today = useApp(s => s.today);
  const update = useApp(s => s.update);
  const [q, setQ] = useState(params.q ?? '');
  const [view, setView] = useState<View>(params.q ? 'all' : 'open');

  const shown = scholarships
    .filter(s => VIEWS[view].test(s) && matches(q, s.name, s.shortName, s.category, s.notes))
    .sort((a, b) => (a.deadlineDate ?? '9999').localeCompare(b.deadlineDate ?? '9999'));

  return (
    <div>
      <PageHeader title="Funding" lede="Scholarships and awards, linked to the programs each one can fund." />

      <label className="relative mb-4 block">
        <span className="sr-only">Search funding</span>
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input className="field pl-10" type="search" placeholder="Name or note" value={q} onChange={e => setQ(e.target.value)} />
      </label>
      <div className="scroll-x mb-5" role="group" aria-label="Show">
        {(Object.keys(VIEWS) as View[]).map(v => (
          <button key={v} className="filter-chip" aria-pressed={view === v} onClick={() => setView(v)}>{VIEWS[v].label}</button>
        ))}
      </div>

      {shown.length === 0 && <div className="panel"><Empty title="Nothing here">Try another filter.</Empty></div>}
      <ul className="grid gap-4 xl:grid-cols-2">
        {shown.map(s => {
          const targets = programs.filter(p => OPEN_PROGRAM.includes(p.status) && (!s.provinces.length || s.provinces.includes(p.province)));
          const ago = daysUntil(s.lastVerified, today);
          const stale = ago === null || -ago > STALE_AFTER_DAYS;
          return (
            <li key={s.id} className={`panel flex flex-col p-4 md:p-5 ${s.discontinued ? 'opacity-75' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-serif text-[21px] font-semibold leading-tight">{s.shortName || s.name}</h2>
                  {s.shortName && <p className="mt-0.5 text-[14px] text-ink-3">{s.name}</p>}
                </div>
                {s.discontinued ? <Chip tone="red">Discontinued</Chip> : <Countdown days={daysUntil(s.deadlineDate, today)} />}
              </div>
              <p className="mt-3 font-semibold">{s.value}</p>
              <p className="mt-1 text-[14px] text-ink-2">{s.deadlineDate ? `${formatDate(s.deadlineDate)}. ` : ''}{s.deadline}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PillSelect<ScholarshipStatus> label={`Status for ${s.shortName}`} value={s.status} options={SCHOLARSHIP_STATUSES} tone={x => STATUS_TONE[x]}
                  onChange={status => update('scholarships', s.id, { status }, `${s.shortName || s.name}: ${status}`)} />
                <PillSelect<EligibilityStatus> label={`Eligible for ${s.shortName}`} value={s.eligibleForMe} options={['Yes', 'Partial', 'No']} tone={x => ELIGIBILITY_TONE[x]}
                  onChange={eligibleForMe => update('scholarships', s.id, { eligibleForMe }, 'Eligibility updated')} />
                <Chip>{s.category}</Chip>
                {!s.internationalEligible && <Chip tone="amber">Citizens and PRs only</Chip>}
              </div>

              {!s.discontinued && (
                <div className="mt-4 rounded-[10px] bg-surface-2 p-3">
                  <p className="text-[13px] font-semibold text-ink-2">
                    {s.provinces.length ? `Only for programs in ${s.provinces.map(p => PROVINCE_NAMES[p] ?? p).join(', ')}` : 'Any province'}: {targets.length} of your open programs
                  </p>
                  {targets.length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[14px]">
                      {targets.slice(0, 8).map(p => <Link key={p.id} href={`/programs/${p.id}`} className="text-accent hover:underline">{p.university}</Link>)}
                      {targets.length > 8 && <span className="text-ink-3">and {targets.length - 8} more</span>}
                    </p>
                  )}
                </div>
              )}

              <details className="group mt-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center text-[14px] font-semibold text-accent">
                  <span className="group-open:hidden">Eligibility, requirements and notes</span><span className="hidden group-open:inline">Hide details</span>
                </summary>
                <dl className="grid gap-3 pb-2 text-[14px]">
                  {([['Eligibility', s.eligibility], ['Requirements', s.requirements], ['Competitiveness', s.competitiveness], ['Notes', s.notes]] as const).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k}><dt className="label mb-0.5">{k}</dt><dd className="whitespace-pre-line text-ink-2">{v}</dd></div>
                  ))}
                </dl>
              </details>

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[13px]">
                {stale && !s.discontinued ? <span className="marker">{s.lastVerified ? `Checked ${formatDate(s.lastVerified)}` : 'Never verified'}</span> : <span className="text-ink-3">Verified {formatDate(s.lastVerified)}</span>}
                <span className="ml-auto flex gap-1">
                  {!s.discontinued && <button className="btn btn-sm btn-quiet" onClick={() => update('scholarships', s.id, { lastVerified: today }, 'Marked as verified today')}><Check size={16} aria-hidden /> Verified</button>}
                  {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="btn btn-sm"><ExternalLink size={15} aria-hidden /> Website</a>}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
