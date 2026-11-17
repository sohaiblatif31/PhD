'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { use, useMemo, useState } from 'react';
import { Countdown, Empty, PageHeader, PillSelect, Progress } from '@/components/ui';
import { buildChecklist, checklistProgress } from '@/lib/checklist';
import { daysUntil, formatDate } from '@/lib/dates';
import { useApp } from '@/lib/store';
import { OPEN_PROGRAM, STALE_AFTER_DAYS } from '@/lib/today';
import type { ApplicationStatus, Program } from '@/lib/types';
import { APPLICATION_STATUSES, STATUS_TONE, matches } from '@/lib/utils';

const VIEWS = {
  open: { label: 'To submit', test: (p: Program) => OPEN_PROGRAM.includes(p.status) },
  all: { label: 'All', test: () => true },
  high: { label: 'High priority', test: (p: Program) => p.priority === 'High' && OPEN_PROGRAM.includes(p.status) },
  recheck: { label: 'Re-check', test: () => true }, // needs today, applied below
  sent: { label: 'Submitted', test: (p: Program) => !OPEN_PROGRAM.includes(p.status) && p.status !== 'Rejected' },
  closed: { label: 'Rejected', test: (p: Program) => p.status === 'Rejected' },
} as const;
type View = keyof typeof VIEWS;

const SORTS = { deadline: 'Deadline', priority: 'Priority', fit: 'Fit', name: 'Name', progress: 'Least ready' } as const;
const RANK = { High: 0, Medium: 1, Low: 2 };

export default function ProgramsPage({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  const params = use(searchParams);
  const programs = useApp(s => s.programs);
  const referees = useApp(s => s.referees);
  const today = useApp(s => s.today);
  const update = useApp(s => s.update);
  const [q, setQ] = useState(params.q ?? '');
  const [view, setView] = useState<View>(params.filter && params.filter in VIEWS ? (params.filter as View) : 'open');
  const [province, setProvince] = useState('');
  const [sort, setSort] = useState<keyof typeof SORTS>('deadline');

  const rows = useMemo(() => programs.map(p => {
    const verifiedAgo = daysUntil(p.lastVerified, today);
    return {
      p,
      days: daysUntil(p.deadlineDate, today),
      pct: checklistProgress(buildChecklist(p, referees)).pct,
      stale: verifiedAgo === null || -verifiedAgo > STALE_AFTER_DAYS,
    };
  }), [programs, referees, today]);

  const shown = rows
    .filter(r => VIEWS[view].test(r.p) && (view !== 'recheck' || (r.stale && OPEN_PROGRAM.includes(r.p.status))))
    .filter(r => !province || r.p.province === province)
    .filter(r => matches(q, r.p.university, r.p.program, r.p.school, r.p.specialization, r.p.city, r.p.notes))
    .sort((a, b) => {
      if (sort === 'priority') return RANK[a.p.priority] - RANK[b.p.priority];
      if (sort === 'fit') return RANK[a.p.fit] - RANK[b.p.fit];
      if (sort === 'name') return a.p.university.localeCompare(b.p.university);
      if (sort === 'progress') return a.pct - b.pct;
      return (a.days ?? Infinity) - (b.days ?? Infinity);
    });

  const provinces = [...new Set(programs.map(p => p.province))].sort();

  return (
    <div>
      <PageHeader
        title="Programs"
        lede={`${programs.filter(p => OPEN_PROGRAM.includes(p.status)).length} still to submit, ${programs.length} in total.`}
        actions={<Link href="/programs/new" className="btn btn-primary"><Plus size={18} aria-hidden /> Add program</Link>}
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search programs</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input className="field pl-10" type="search" placeholder="University, program, city or note" value={q} onChange={e => setQ(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <select className="field md:w-40" aria-label="Province" value={province} onChange={e => setProvince(e.target.value)}>
            <option value="">All provinces</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="field md:w-44" aria-label="Sort by" value={sort} onChange={e => setSort(e.target.value as keyof typeof SORTS)}>
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v}</option>)}
          </select>
        </div>
      </div>

      <div className="scroll-x mb-5" role="group" aria-label="Show">
        {(Object.keys(VIEWS) as View[]).map(v => (
          <button key={v} className="filter-chip" aria-pressed={view === v} onClick={() => setView(v)}>{VIEWS[v].label}</button>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,1fr)_150px_150px_170px] gap-4 border-b border-line px-4 py-2.5 text-[13px] font-semibold text-ink-3 md:grid">
          <span>{shown.length} {shown.length === 1 ? 'program' : 'programs'}</span><span>Deadline</span><span>Documents</span><span>Status</span>
        </div>
        {shown.length === 0 && <Empty title="No programs here">Try another filter, or clear the search.</Empty>}
        <ul>
          {shown.map(({ p, days, pct, stale }) => (
            <li key={p.id} className="list-row relative md:grid md:grid-cols-[minmax(0,1fr)_150px_150px_170px] md:items-center md:gap-4">
              <div className="min-w-0">
                <Link href={`/programs/${p.id}`} className="after:absolute after:inset-0 md:after:content-none">
                  <span className="block font-serif text-[19px] font-semibold leading-snug hover:text-accent">{p.university}</span>
                </Link>
                <span className="block truncate text-[14px] text-ink-2">{p.program}</span>
                <span className="mt-1 flex flex-wrap gap-x-3 text-[13px] text-ink-3">
                  <span>{p.city}{p.province && `, ${p.province}`}</span>
                  {p.priority === 'High' && <span className="font-semibold text-red">High priority</span>}
                  {stale && OPEN_PROGRAM.includes(p.status) && <span className="marker">re-check</span>}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 md:mt-0 md:block">
                <Countdown days={days} />
                <span className="ml-1 text-[13px] text-ink-3 md:ml-0 md:mt-1 md:block">{formatDate(p.deadlineDate)}</span>
              </div>
              <div className="mt-3 flex items-center gap-3 md:mt-0">
                <span className="flex-1"><Progress pct={pct} label={`${p.university} documents`} /></span>
                <span className="num w-10 text-right text-[13px] text-ink-3">{pct}%</span>
              </div>
              <div className="relative z-10 mt-3 md:mt-0">
                <PillSelect<ApplicationStatus> label={`Status for ${p.university}`} value={p.status} options={APPLICATION_STATUSES}
                  tone={s => STATUS_TONE[s]} onChange={status => update('programs', p.id, { status }, `${p.university}: ${status}`)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
