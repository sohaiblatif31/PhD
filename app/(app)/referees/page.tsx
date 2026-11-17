'use client';

import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Chip, Countdown, Empty, Field, PageHeader, Sheet } from '@/components/ui';
import { LETTERS_NEEDED, letterCounts } from '@/lib/checklist';
import { daysUntil, formatDate } from '@/lib/dates';
import { newId, useApp } from '@/lib/store';
import { OPEN_PROGRAM } from '@/lib/today';
import type { LetterRequest, Referee } from '@/lib/types';

type Draft = Pick<Referee, 'name' | 'email' | 'affiliation' | 'relationship' | 'notes'>;
const empty = (): Draft => ({ name: '', email: '', affiliation: '', relationship: '', notes: '' });

export default function RefereesPage() {
  const referees = useApp(s => s.referees);
  const programs = useApp(s => s.programs);
  const today = useApp(s => s.today);
  const { update, create, remove, notify } = useApp(s => ({ update: s.update, create: s.create, remove: s.remove, notify: s.notify }));
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);

  const open = programs.filter(p => OPEN_PROGRAM.includes(p.status)).sort((a, b) => (a.deadlineDate ?? '9999').localeCompare(b.deadlineDate ?? '9999'));
  const short = open.filter(p => letterCounts(p.id, referees).submitted < LETTERS_NEEDED);
  const setRequests = (r: Referee, requests: LetterRequest[], done: string) => update('referees', r.id, { requests }, done);

  async function save() {
    if (!editing) return;
    if (!editing.draft.name.trim()) return notify('A name is required', true);
    const ok = editing.id
      ? await update('referees', editing.id, editing.draft, 'Saved')
      : await create('referees', { ...editing.draft, id: newId('ref'), requests: [], createdAt: new Date().toISOString() }, 'Referee added');
    if (ok) setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Referees" lede={`Who is writing for you, for which programs, and what has arrived. Each program counts as ready at ${LETTERS_NEEDED} submitted letters.`}
        actions={<button className="btn btn-primary" onClick={() => setEditing({ id: null, draft: empty() })}><Plus size={18} aria-hidden /> Add referee</button>} />

      {referees.length === 0 ? (
        <div className="panel"><Empty title="No referees yet" action={<button className="btn btn-primary" onClick={() => setEditing({ id: null, draft: empty() })}>Add your first referee</button>}>
          Add the people writing your letters, then log which programs you asked them for.
        </Empty></div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {referees.map(r => {
            const asked = new Set(r.requests.map(q => q.programId));
            const sent = r.requests.filter(q => q.submittedAt).length;
            return (
              <li key={r.id} className="panel p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-serif text-[21px] font-semibold leading-tight">{r.name}</h2>
                    <p className="text-[14px] text-ink-2">{[r.relationship, r.affiliation].filter(Boolean).join(', ')}</p>
                    {r.email && <a href={`mailto:${r.email}`} className="break-all text-[14px] font-medium text-accent">{r.email}</a>}
                  </div>
                  <button className="icon-btn -mr-2 -mt-2" aria-label={`Edit ${r.name}`} onClick={() => setEditing({ id: r.id, draft: { name: r.name, email: r.email, affiliation: r.affiliation, relationship: r.relationship, notes: r.notes } })}><Pencil size={18} /></button>
                </div>
                <p className="mt-3 text-[13px] font-semibold text-ink-3">{sent} of {r.requests.length} letters submitted</p>
                <ul className="mt-1">
                  {r.requests.map(q => {
                    const p = programs.find(x => x.id === q.programId);
                    return (
                      <li key={q.programId} className="flex items-center gap-2 border-t border-line py-2 first:border-0">
                        <span className="min-w-0 flex-1">
                          <Link href={`/programs/${q.programId}`} className="block truncate font-semibold hover:text-accent">{p?.university ?? 'Deleted program'}</Link>
                          <span className="text-[13px] text-ink-3">Asked {formatDate(q.requestedAt, false)}{q.submittedAt && `, in ${formatDate(q.submittedAt, false)}`}</span>
                        </span>
                        {!q.submittedAt && p && <Countdown days={daysUntil(p.deadlineDate, today)} />}
                        <button className={`btn btn-sm ${q.submittedAt ? 'text-moss' : ''}`} aria-pressed={!!q.submittedAt}
                          onClick={() => setRequests(r, r.requests.map(x => x.programId === q.programId ? { ...x, submittedAt: x.submittedAt ? null : today } : x), q.submittedAt ? 'Marked as not submitted' : 'Letter marked as submitted')}>
                          {q.submittedAt ? <><Check size={16} aria-hidden /> In</> : 'Mark in'}
                        </button>
                        <button className="icon-btn" aria-label={`Remove request for ${p?.university ?? 'program'}`} onClick={() => setRequests(r, r.requests.filter(x => x.programId !== q.programId), 'Request removed')}><X size={17} /></button>
                      </li>
                    );
                  })}
                </ul>
                <select className="field mt-2" value="" aria-label={`Ask ${r.name} for another program`}
                  onChange={e => e.target.value && setRequests(r, [...r.requests, { programId: e.target.value, requestedAt: today, submittedAt: null }], 'Request logged')}>
                  <option value="">Log a request for…</option>
                  {open.filter(p => !asked.has(p.id)).map(p => <option key={p.id} value={p.id}>{p.university}: {p.program}</option>)}
                </select>
                {r.notes && <p className="mt-3 text-[13px] italic text-ink-3">{r.notes}</p>}
              </li>
            );
          })}
        </ul>
      )}

      {referees.length > 0 && short.length > 0 && (
        <section className="mt-8" aria-labelledby="short">
          <h2 id="short" className="section-title mb-3">Programs still short of letters</h2>
          <ul className="panel">
            {short.map(p => {
              const c = letterCounts(p.id, referees);
              return (
                <li key={p.id} className="list-row flex items-center gap-3">
                  <Link href={`/programs/${p.id}`} className="min-w-0 flex-1 font-semibold hover:text-accent">{p.university}</Link>
                  <Chip tone={c.requested >= LETTERS_NEEDED ? 'amber' : 'red'}>{c.submitted} in, {c.requested} asked</Chip>
                  <Countdown days={daysUntil(p.deadlineDate, today)} className="hidden sm:inline-flex" />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Sheet open={!!editing} onOpenChange={o => !o && setEditing(null)} title={editing?.id ? 'Edit referee' : 'Add referee'}>
        {editing && (
          <form className="grid gap-4" onSubmit={e => { e.preventDefault(); save(); }}>
            {([['name', 'Name'], ['relationship', 'Relationship', 'e.g. MPhil supervisor'], ['affiliation', 'Institution'], ['email', 'Email']] as const).map(([k, label, ph]) => (
              <Field key={k} label={label}>
                <input className="field" type={k === 'email' ? 'email' : 'text'} placeholder={ph} value={editing.draft[k]} onChange={e => setEditing({ ...editing, draft: { ...editing.draft, [k]: e.target.value } })} />
              </Field>
            ))}
            <Field label="Notes"><textarea className="field" rows={3} value={editing.draft.notes} onChange={e => setEditing({ ...editing, draft: { ...editing.draft, notes: e.target.value } })} /></Field>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary flex-1 md:flex-none">{editing.id ? 'Save' : 'Add referee'}</button>
              {editing.id && <button type="button" className="btn btn-danger" onClick={async () => {
                if (confirm('Delete this referee and their letter requests?') && await remove('referees', editing.id!, 'Referee deleted')) setEditing(null);
              }}><Trash2 size={16} aria-hidden /> Delete</button>}
            </div>
          </form>
        )}
      </Sheet>
    </div>
  );
}
