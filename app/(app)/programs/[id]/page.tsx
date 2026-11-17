'use client';

import { ArrowLeft, Check, Circle, CircleCheck, CircleDot, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import ProgramForm from '@/components/ProgramForm';
import { Chip, Empty, PillSelect, Progress, Sheet } from '@/components/ui';
import { buildChecklist, checklistProgress, NEXT_STATUS, withDocStatus, type ChecklistItem } from '@/lib/checklist';
import { daysUntil, formatDate } from '@/lib/dates';
import { newId, useApp } from '@/lib/store';
import { outreachStage, scholarshipsFor, STALE_AFTER_DAYS } from '@/lib/today';
import type { ApplicationStatus, DocumentStatus, Priority } from '@/lib/types';
import { APPLICATION_STATUSES, ELIGIBILITY_TONE, PRIORITY_TONE, PROVINCE_NAMES, STATUS_TONE, sameUniversity } from '@/lib/utils';

const DOC_ICON: Record<DocumentStatus, typeof Circle> = { 'Not Started': Circle, 'In Progress': CircleDot, Done: CircleCheck };
const STAGE_TONE = { 'To contact': 'neutral', 'Follow up': 'red', Waiting: 'amber', Replied: 'moss' } as const;

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const s = useApp(st => st);
  const program = s.programs.find(p => p.id === id);
  const [editing, setEditing] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [notes, setNotes] = useState<string | null>(null);

  if (!program) {
    return <Empty title="Program not found" action={<Link href="/programs" className="btn">Back to programs</Link>}>It may have been deleted.</Empty>;
  }
  const p = program;
  const items = buildChecklist(p, s.referees);
  const prog = checklistProgress(items);
  const days = daysUntil(p.deadlineDate, s.today);
  const verifiedAgo = daysUntil(p.lastVerified, s.today);
  const stale = verifiedAgo === null || -verifiedAgo > STALE_AFTER_DAYS;
  const faculty = s.supervisors.filter(x => sameUniversity(x.university, p.university));
  const funding = scholarshipsFor(p, s);
  const letters = s.referees.flatMap(r => r.requests.filter(q => q.programId === p.id).map(q => ({ r, q })));
  const unasked = s.referees.filter(r => !r.requests.some(q => q.programId === p.id));

  const save = (patch: Parameters<typeof s.update<'programs'>>[2], done?: string) => s.update('programs', p.id, patch, done);
  const toggle = (it: ChecklistItem) => save({ documents: withDocStatus(p, it.id, NEXT_STATUS[it.status]) });
  const addItem = () => {
    const name = newItem.trim();
    if (!name) return;
    save({ documents: [...p.documents, { id: newId('c'), name, status: 'Not Started' }] }, 'Item added');
    setNewItem('');
  };
  const setLetter = (refId: string, change: (reqs: typeof letters[number]['q'][]) => typeof letters[number]['q'][], done: string) => {
    const r = s.referees.find(x => x.id === refId)!;
    s.update('referees', refId, { requests: change(r.requests) }, done);
  };

  return (
    <div>
      <Link href="/programs" className="-ml-2 mb-3 inline-flex min-h-11 items-center gap-1 rounded-[10px] px-2 text-[15px] font-medium text-ink-2 hover:text-ink">
        <ArrowLeft size={18} aria-hidden /> Programs
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <h1 className="page-title">{p.university}</h1>
          <p className="mt-2 text-[17px] text-ink-2">{p.program}{p.school && <span className="text-ink-3">, {p.school}</span>}</p>
          <p className="mt-2 flex flex-wrap gap-2">
            <Chip>{p.city}{p.city && ', '}{PROVINCE_NAMES[p.province] ?? p.province}</Chip>
            <Chip>{p.language}</Chip>
            <Chip tone={p.fit === 'High' ? 'moss' : 'neutral'}>{p.fit} fit</Chip>
            <Chip>{p.gmatRequired === 'No' ? 'No GMAT/GRE' : p.gmatRequired === 'Optional' ? 'GMAT/GRE optional' : 'GMAT/GRE required'}</Chip>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.applyLink && <a href={p.applyLink} target="_blank" rel="noreferrer" className="btn btn-primary"><ExternalLink size={17} aria-hidden /> Application page</a>}
          <button className="btn" onClick={() => setEditing(true)}><Pencil size={16} aria-hidden /> Edit</button>
        </div>
      </header>

      <section className="panel mb-6 grid gap-5 p-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-6" aria-label="Deadline and status">
        <div className="flex items-baseline gap-3">
          <span className={`num font-serif text-[56px] font-medium leading-none tracking-tight ${days !== null && days <= 14 ? 'late' : ''}`}>{days === null ? '—' : Math.abs(days)}</span>
          <span className="text-[15px] text-ink-2">{days === null ? 'rolling' : days < 0 ? 'days past' : days === 1 ? 'day left' : 'days left'}</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{formatDate(p.deadlineDate)}</p>
          {p.deadline && <p className="mt-0.5 text-[14px] text-ink-2">{p.deadline}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
            {stale
              ? <span className="marker">{p.lastVerified ? `Verified ${formatDate(p.lastVerified)}; re-check` : 'Never verified against the official page'}</span>
              : <span className="text-moss">Verified {formatDate(p.lastVerified)}</span>}
            <button className="btn btn-sm btn-quiet" onClick={() => save({ lastVerified: s.today }, 'Marked as verified today')}><Check size={16} aria-hidden /> I checked it today</button>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
          <PillSelect<ApplicationStatus> label="Status" value={p.status} options={APPLICATION_STATUSES} tone={x => STATUS_TONE[x]} onChange={status => save({ status }, `Status: ${status}`)} />
          <PillSelect<Priority> label="Priority" value={p.priority} options={['High', 'Medium', 'Low']} tone={x => PRIORITY_TONE[x]} onChange={priority => save({ priority }, `Priority: ${priority}`)} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="panel p-4 md:p-5" aria-labelledby="docs">
            <div className="mb-1 flex items-baseline justify-between gap-4">
              <h2 id="docs" className="section-title">Application checklist</h2>
              <span className="num text-sm text-ink-3">{prog.done} of {prog.total} done</span>
            </div>
            <div className="mb-3"><Progress pct={prog.pct} label="Checklist" /></div>
            <ul>
              {items.map(it => {
                const Icon = DOC_ICON[it.status];
                const tone = it.status === 'Done' ? 'text-moss' : it.status === 'In Progress' ? 'text-accent' : 'text-ink-3';
                return (
                  <li key={it.id} className="flex items-center gap-1 border-t border-line first:border-0">
                    {it.derived ? (
                      <Link href="/referees" className="flex min-h-12 flex-1 items-center gap-3 py-2">
                        <Icon size={22} className={tone} aria-hidden />
                        <span className="flex-1">{it.name}</span>
                        <span className="text-[13px] text-accent">Referees</span>
                      </Link>
                    ) : (
                      <button className="flex min-h-12 flex-1 items-center gap-3 py-2 text-left" onClick={() => toggle(it)} aria-label={`${it.name}: ${it.status}. Tap to change`}>
                        <Icon size={22} className={tone} aria-hidden />
                        <span className={`flex-1 ${it.status === 'Done' ? 'text-ink-3 line-through decoration-1' : ''}`}>{it.name}</span>
                        {it.optional && <Chip>optional</Chip>}
                        {it.status === 'In Progress' && <span className="text-[13px] text-accent">in progress</span>}
                      </button>
                    )}
                    {it.custom && (
                      <button className="icon-btn" aria-label={`Remove ${it.name}`} onClick={() => save({ documents: p.documents.filter(d => d.id !== it.id) }, 'Item removed')}><X size={18} /></button>
                    )}
                  </li>
                );
              })}
            </ul>
            <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); addItem(); }}>
              <label className="flex-1"><span className="sr-only">New checklist item</span>
                <input className="field" placeholder="Add an item, e.g. Writing sample" value={newItem} onChange={e => setNewItem(e.target.value)} />
              </label>
              <button className="btn" aria-label="Add item"><Plus size={18} /></button>
            </form>
          </section>

          <section className="panel p-4 md:p-5" aria-labelledby="refs">
            <h2 id="refs" className="section-title mb-2">Reference letters</h2>
            {letters.length === 0 && <p className="text-[14px] text-ink-3">No letters requested for this program yet.</p>}
            <ul>
              {letters.map(({ r, q }) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line py-2 first:border-0">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{r.name}</span>
                    <span className="text-[13px] text-ink-3">Requested {formatDate(q.requestedAt)}{q.submittedAt && `, submitted ${formatDate(q.submittedAt)}`}</span>
                  </span>
                  <button className={`btn btn-sm ${q.submittedAt ? 'text-moss' : ''}`}
                    onClick={() => setLetter(r.id, reqs => reqs.map(x => x.programId === p.id ? { ...x, submittedAt: x.submittedAt ? null : s.today } : x), q.submittedAt ? 'Marked as not submitted' : 'Letter marked as submitted')}>
                    {q.submittedAt ? <><Check size={16} aria-hidden /> Submitted</> : 'Mark submitted'}
                  </button>
                </li>
              ))}
            </ul>
            {unasked.length > 0 ? (
              <label className="mt-3 block">
                <span className="sr-only">Request a letter from</span>
                <select className="field" value="" onChange={e => e.target.value && setLetter(e.target.value, reqs => [...reqs, { programId: p.id, requestedAt: s.today, submittedAt: null }], 'Letter request logged')}>
                  <option value="">Log a request from…</option>
                  {unasked.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
            ) : s.referees.length === 0 && <Link href="/referees" className="mt-2 inline-block text-sm font-semibold text-accent">Add your referees</Link>}
          </section>

          <section className="panel p-4 md:p-5" aria-labelledby="details">
            <h2 id="details" className="section-title mb-3">Details</h2>
            <dl className="grid gap-4 text-[15px]">
              {([['Funding', p.funding.includes(p.fundingAmount) ? p.funding : [p.fundingAmount, p.funding].filter(Boolean).join('. ')], ['Eligibility', p.eligibility], ['Requirements', p.requirements], ['Competitiveness', p.competitiveness], ['Duration', p.duration], ['Other', p.otherInfo]] as const)
                .filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><dt className="label mb-0.5">{k}</dt><dd className="max-w-[70ch] whitespace-pre-line text-ink-2">{v}</dd></div>
                ))}
            </dl>
            <label className="mt-5 block">
              <span className="label">Notes</span>
              <textarea className="field" rows={5} value={notes ?? p.notes} onChange={e => setNotes(e.target.value)}
                onBlur={() => { if (notes !== null && notes !== p.notes) save({ notes }, 'Notes saved'); setNotes(null); }} />
              <span className="mt-1 block text-[13px] text-ink-3">Saves when you leave the box.</span>
            </label>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <section className="panel p-4" aria-labelledby="fac">
            <h2 id="fac" className="section-title mb-2">Faculty here</h2>
            {faculty.length === 0 ? <p className="text-[14px] text-ink-3">No supervisors saved for {p.university}.</p> : (
              <ul>
                {faculty.map(f => {
                  const stage = outreachStage(f, s.today);
                  return (
                    <li key={f.id} className="border-t border-line first:border-0">
                      <Link href={`/supervisors?q=${encodeURIComponent(f.name)}`} className="flex min-h-12 items-center justify-between gap-3 py-2">
                        <span className="min-w-0"><span className="block truncate font-semibold">{f.name}</span><span className="block truncate text-[13px] text-ink-3">{f.researchFocus}</span></span>
                        <Chip tone={STAGE_TONE[stage]}>{stage}</Chip>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="panel p-4" aria-labelledby="fund">
            <h2 id="fund" className="section-title">Funding you can pair with it</h2>
            <p className="mb-2 mt-1 text-[13px] text-ink-3">Federal and foundation awards, plus awards for {PROVINCE_NAMES[p.province] ?? p.province}.</p>
            <ul>
              {funding.map(f => (
                <li key={f.id} className="border-t border-line first:border-0">
                  <Link href={`/scholarships?q=${encodeURIComponent(f.shortName || f.name)}`} className="flex min-h-12 items-center justify-between gap-3 py-2">
                    <span className="min-w-0"><span className="block font-semibold">{f.shortName || f.name}</span><span className="block truncate text-[13px] text-ink-3">{f.valueAmount || f.value}</span></span>
                    <Chip tone={ELIGIBILITY_TONE[f.eligibleForMe]}>{f.eligibleForMe === 'Yes' ? 'Eligible' : f.eligibleForMe === 'Partial' ? 'Partly' : 'Not eligible'}</Chip>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <button className="btn btn-danger" onClick={async () => {
            if (!confirm(`Delete ${p.university}, ${p.program}? This cannot be undone.`)) return;
            if (await s.remove('programs', p.id, 'Program deleted')) router.push('/programs');
          }}><Trash2 size={16} aria-hidden /> Delete program</button>
        </aside>
      </div>

      <Sheet open={editing} onOpenChange={setEditing} title="Edit program">
        <ProgramForm initial={p} submitLabel="Save changes" onCancel={() => setEditing(false)}
          onSubmit={async d => { if (await save(d, 'Program saved')) setEditing(false); }} />
      </Sheet>
    </div>
  );
}
